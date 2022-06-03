import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatSelect } from '@angular/material/select';
import { ReplaySubject, Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';

export interface MultiSelectionItem {
  id: string;
  name: string;
  selected: boolean;
}

@Component({
  selector: 'app-multiple-selection',
  templateUrl: './multiple-selection.component.html',
  styleUrls: ['./multiple-selection.component.scss'],
})
export class MultipleSelectionComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() set items(value: MultiSelectionItem[]) {
    this.initialize(value);
  }

  @Input() placeholder: string = '';
  @Input() title: string = '';

  @Output() onChange: EventEmitter<MultiSelectionItem[]> = new EventEmitter();

  protected selections: MultiSelectionItem[] = [];

  /** total number of available entries */
  public allItemsSize = 0; //this.items.length;

  /** control for the selected item for multi-selection */
  public itemMultiCtrl: FormControl = new FormControl();

  /** control for the MatSelect filter keyword multi-selection */
  public itemMultiFilterCtrl: FormControl = new FormControl();

  /** list of items filtered by search keyword */
  public filteredItemsMulti: ReplaySubject<MultiSelectionItem[]> = new ReplaySubject<
    MultiSelectionItem[]
  >(1);

  /** local copy of filtered items to help set the toggle all checkbox state */
  protected filteredItemsCache: MultiSelectionItem[] = [];

  /** flags to set the toggle all checkbox state */
  isIndeterminate = false;
  isChecked = false;

  @ViewChild('multiSelect', { static: true }) multiSelect: MatSelect;

  /** Subject that emits when the component has been destroyed. */
  protected _onDestroy = new Subject<void>();

  constructor() {}

  ngOnInit() {
    // listen for search field value changes
    this.itemMultiFilterCtrl.valueChanges.pipe(takeUntil(this._onDestroy)).subscribe(() => {
      this.filterItemsMulti();
      this.setToggleAllCheckboxState();
    });

    // listen for multi select field value changes
    this.itemMultiCtrl.valueChanges.pipe(takeUntil(this._onDestroy)).subscribe(() => {
      this.setToggleAllCheckboxState();
    });
  }

  initialize(items: any[]): void {
    this.selections = items;
    this.allItemsSize = items.length;

    // set initial selection
    const preSelections = this.selections.filter((item) => item.selected);
    this.itemMultiCtrl.setValue(preSelections);

    // load the initial item list
    this.filteredItemsMulti.next(this.selections.slice());
  }

  ngAfterViewInit() {
    this.setInitialValue();
  }

  ngOnDestroy() {
    this._onDestroy.next();
    this._onDestroy.complete();
  }

  toggleSelectAll(selectAllValue: boolean) {
    this.filteredItemsMulti.pipe(take(1), takeUntil(this._onDestroy)).subscribe((val) => {
      if (selectAllValue) {
        this.itemMultiCtrl.patchValue(val);
      } else {
        this.itemMultiCtrl.patchValue([]);
      }
    });
  }

  /**
   * Sets the initial value after the filteredItems are loaded initially
   */
  protected setInitialValue() {
    this.filteredItemsMulti.pipe(take(1), takeUntil(this._onDestroy)).subscribe(() => {
      // setting the compareWith property to a comparison function
      // triggers initializing the selection according to the initial value of
      // the form control (i.e. _initializeSelection())
      // this needs to be done after the filteredItems are loaded initially
      // and after the mat-option elements are available
      this.multiSelect.compareWith = (a: MultiSelectionItem, b: MultiSelectionItem) =>
        a && b && a.id === b.id;
    });
  }

  protected filterItemsMulti() {
    if (!this.selections) {
      return;
    }
    // get the search keyword
    let search = this.itemMultiFilterCtrl.value;
    if (!search) {
      this.filteredItemsCache = this.selections.slice();
      this.filteredItemsMulti.next(this.filteredItemsCache);
      return;
    } else {
      search = search.toLowerCase();
    }
    // filter the items
    this.filteredItemsCache = this.selections.filter(
      (item) => item.name.toLowerCase().indexOf(search) > -1
    );
    this.filteredItemsMulti.next(this.filteredItemsCache);
  }

  protected setToggleAllCheckboxState() {
    let filteredLength = 0;
    if (this.itemMultiCtrl && this.itemMultiCtrl.value) {
      this.filteredItemsCache.forEach((el) => {
        if (this.itemMultiCtrl.value.indexOf(el) > -1) {
          filteredLength++;
        }
      });
      this.isIndeterminate = filteredLength > 0 && filteredLength < this.filteredItemsCache.length;
      this.isChecked = filteredLength > 0 && filteredLength === this.filteredItemsCache.length;

      this.onChange.emit(this.itemMultiCtrl.value);
    }
  }
}
