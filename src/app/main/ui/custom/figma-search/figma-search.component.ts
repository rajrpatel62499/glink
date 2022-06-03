import { Component, EventEmitter, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { FormControl } from '@angular/forms';
import { fuseAnimations } from '@fuse/animations';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-figma-search',
  templateUrl: './figma-search.component.html',
  styleUrls: ['./figma-search.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations,
})
export class FigmaSearchComponent implements OnInit {
  @Output() searchChanged: EventEmitter<any>;

  searchInput: FormControl;
  private _unsubscribeAll: Subject<any>;
  constructor() { 
   this.searchInput = new FormControl('');
   this.searchChanged = new EventEmitter();
   this._unsubscribeAll = new Subject();
  }

  ngOnInit(): void {
    this.searchInput.valueChanges
      .pipe(takeUntil(this._unsubscribeAll), debounceTime(300), distinctUntilChanged())
      .subscribe((searchText) => {
        // this.users = this.getFilteredEmployeesFromText(searchText);
        this.searchChanged.emit(searchText);
      });
  }

}
