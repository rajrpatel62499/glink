import { FormControl } from '@angular/forms';
import { Component, Input, OnInit, SimpleChange } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { map, startWith, takeUntil, tap } from 'rxjs/operators';

export interface AutoCompleteOption {
  viewValue: string;
  value: any;
}

@Component({
  selector: 'figma-autocomplete',
  templateUrl: './figma-autocomplete.component.html',
  styleUrls: ['./figma-autocomplete.component.scss'],
})
export class FigmaAutocompleteComponent implements OnInit {

  @Input() label: string = '';
  @Input() placeholder: string = '';
  @Input() required: boolean = false;
  @Input() selectFromOption: boolean = true;
  @Input() errorMsg: string = 'Please select from dropdown';


  @Input() options: AutoCompleteOption[] = [];
  @Input() control: FormControl = new FormControl();

  filteredOptions: Observable<AutoCompleteOption[]>;

  private _unsubscribeAll: Subject<any>;

  constructor() {}

  ngOnChanges(changes: { [propName: string]: SimpleChange}) {
    if (changes["control"] && !changes["control"].firstChange && changes["control"].currentValue) {
      this.listenForControlChanges();    
    }
  }

  ngOnInit(): void {
    this._unsubscribeAll = new Subject();
    this.listenForControlChanges();    
  }

  listenForControlChanges() {
    this.filteredOptions = this.control.valueChanges.pipe(
      takeUntil(this._unsubscribeAll),
      startWith(''),
      map(value => {
        return (typeof value === 'string' ? value : value ? value.viewValue : '')
      } ),
      map(name => (name ? this._filterOption(name) : this.options.slice())),
    );

    if (this.selectFromOption) {
      
      this.control.valueChanges
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(res=> {
        if (this.options.findIndex(x => x.value == res?.value) == -1){
            this.control.setErrors({ notInclude: true})
        }
      })
    }
  }


  displayWithFn(option: AutoCompleteOption) {
    return option && option.viewValue ? option.viewValue : '';
  }

  private _filterOption(value: string ): AutoCompleteOption[] {
    let filterValue = value;
    return this.options.filter((option) => {
      return option.viewValue.toLowerCase().includes(filterValue) || option.viewValue.includes(filterValue) ;
    });
  }


  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }

}
