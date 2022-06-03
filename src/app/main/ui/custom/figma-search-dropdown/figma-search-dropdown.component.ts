import {
  Component,
  Input,
  OnInit,
  Output,
  ViewEncapsulation,
  EventEmitter,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatMenu } from '@angular/material/menu';
import { of } from 'rxjs';
import { debounceTime, switchMap, startWith } from 'rxjs/operators';


export class FigmaSearchDropdwonConfig {
  showSearch?: boolean = true;
  showTitle?: boolean = true;
  showSelection?: boolean = true;
  showDivider?: boolean = true;
  showAllItemsInSingleList?: boolean = false;
}

@Component({
  selector: 'figma-search-dropdown',
  templateUrl: './figma-search-dropdown.component.html',
  styleUrls: ['./figma-search-dropdown.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FigmaSearchDropdownComponent implements OnInit {
  @Input() title: string = '';
  @Input('selectAll') selectAll: boolean = false;

  @Input('config') config: FigmaSearchDropdwonConfig = new FigmaSearchDropdwonConfig();

  @Input('dropdownFlavors') 
  set dropdownFlavors(value) {
    // by default selection
    if (value == 'multiselectWithSearch') {

    } else if (value == 'multiselect') {
      this.config = {
        showSearch: false,
        showTitle: false,
        showSelection: false,
        showDivider: false,
        showAllItemsInSingleList: true
      }
    }
  }

  @Input('panelClass') panelClass: string = 'w-308';
  @Input('selectionListClass') selectionListClass: string = '';

  _data: { selected: boolean; value: any; data: any }[] = [];
  @Input('data')
  set setData(value: any[]) {
    if (value) {
      this._data = [...value];
      this.selectionControl.setValue([]);
      // selecting deselecting based on the x.selected property.
      this._data.forEach((x) => {
        let value = this.selectionControl.value || [];
        if (x.selected) value.push(x);
        // else value = value.filter((x: any) => x != x);
        this.selectionControl.setValue(value);
      });
      this.search.setValue(this.search.value);
    }
  }

  @Output() selectionChange: EventEmitter<any> = new EventEmitter();
  @Output() searchChange: EventEmitter<any> = new EventEmitter();
  @Output() close: EventEmitter<any> = new EventEmitter();

  search = new FormControl();
  selectionControl = new FormControl();

  $search = this.search.valueChanges.pipe(
    startWith(null),
    debounceTime(200),
    switchMap((res: string) => {
      if (!res) return of(this._data);
      res = res.toLowerCase();
      return of(this._data.filter((x) => x.value.toLowerCase().indexOf(res) >= 0));
    })
  );

  get selectedItems() {
    return this._data.filter((x) => x.selected);
  }

  constructor(private _cdr: ChangeDetectorRef) {}

  ngOnInit(): void {}

  onSearchChange(event: HTMLInputElement) {
    this.searchChange.emit(event.value);
  }

  onOptionClicked(event: PointerEvent, item) {
    event.stopImmediatePropagation();
    item.selected = !item.selected;
    this._cdr.detectChanges();
    this.search.setValue(this.search.value); // hotfix for showing the selected and nonselected items. required
    this.selectionChange.emit(this.selectedItems);
    
  }

  selectionChangeMethod(option: any) {
    let value = this.selectionControl.value || [];
    if (option.selected) value.push(option.value);
    else value = value.filter((x: any) => x != option.value);
    this.selectionControl.setValue(value);
  }

  onClose() {
    this.close.emit(this.selectedItems);
  }

  onSelectAll(event: PointerEvent) {
    event.stopImmediatePropagation();

    if (this.selectAll) {
      // deselect all
      this._data.forEach((x) => (x.selected = false));
    } else {
      // select all
      this._data.forEach((x) => (x.selected = true));
    }
    this.selectAll = !this.selectAll;
    this.updateSelectionInUI();
  }

  updateSelectionInUI() {
    this.selectionControl.setValue([]);
    // selecting deselecting based on the x.selected property.
    this._data.forEach((x) => {
      let value = this.selectionControl.value || [];
      if (x.selected) value.push(x);
      // else value = value.filter((x: any) => x != x);
      this.selectionControl.setValue(value);
    });
    this.search.setValue(this.search.value);
  }
}
