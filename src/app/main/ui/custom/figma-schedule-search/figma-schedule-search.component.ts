import { Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { FormControl } from '@angular/forms';
import { fuseAnimations } from '@fuse/animations';
import { ScheduleService } from 'app/main/apps/schedule/figma.service';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, skip, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-figma-schedule-search',
  templateUrl: './figma-schedule-search.component.html',
  styleUrls: ['./figma-schedule-search.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations,
})
export class FigmaScheduleSearchComponent implements OnInit {
  @Output() searchChanged: EventEmitter<any>;

  @Input() banner: any;


  searchInput: FormControl;
  dateRangeStartInput: FormControl;
  dateRangeEndInput: FormControl;

  private _unsubscribeAll: Subject<any>;
  constructor(private _scheduleService: ScheduleService) { 
   this.searchInput = new FormControl('');
   this.searchChanged = new EventEmitter();
   this._unsubscribeAll = new Subject();
  }

  ngOnInit(): void {
    // this.searchInput.valueChanges
    //   .pipe(takeUntil(this._unsubscribeAll), debounceTime(300), distinctUntilChanged())
    //   .subscribe((searchText) => {
    //     // this.users = this.getFilteredEmployeesFromText(searchText);
    //     this.searchChanged.emit(searchText);
    //   });
    const filters = this._scheduleService.getCurrentFilters();
    this.dateRangeStartInput = new FormControl(
      filters.dateRangeStart ? filters.dateRangeStart : new Date()
    );
    this.dateRangeEndInput = new FormControl(
      filters.dateRangeEnd ? filters.dateRangeEnd : new Date()
    );

    this.searchInput.valueChanges
      .pipe(takeUntil(this._unsubscribeAll), debounceTime(300), distinctUntilChanged())
      .subscribe((searchText) => {
        this._scheduleService.searchTextChange(searchText);
      });

    this.dateRangeStartInput.valueChanges
      .pipe(skip(1), takeUntil(this._unsubscribeAll), debounceTime(300), distinctUntilChanged())
      .subscribe(() => {
        const dateRangeEnd = this.dateRangeEndInput ? this.dateRangeEndInput.value : new Date();
        this._scheduleService.onDateRangeEndChanged.next(dateRangeEnd); // used for excel error
      });

    this.dateRangeEndInput.valueChanges
      .pipe(skip(1), takeUntil(this._unsubscribeAll), debounceTime(300), distinctUntilChanged())
      .subscribe((end) => {
        if (!end) {
          return;
        }
        const dateRangeStart = this.dateRangeStartInput
          ? this.dateRangeStartInput.value
          : new Date();
        const dateRangeEnd = this.dateRangeEndInput ? this.dateRangeEndInput.value : new Date();

        this._scheduleService.setFilterDateRangeStart(dateRangeStart);
        this._scheduleService.setFilterDateRangeEnd(dateRangeEnd);
        this._scheduleService.getAllDataSchedulesByLocationId(
          // this.banner.client?.locations[0]._id ? this.banner.client?.locations[0]._id : null
        );
        this._scheduleService.onDateRangeEndChanged.next(dateRangeEnd); // used for excel error
      });

  }

  // getCurrentFilters() {
  //   return {
  //     dateRangeStart: this.filterDateRangeStart,
  //     dateRangeEnd: this.filterDateRangeEnd,
  //     location: this.filterLocation,
  //   };
  // }

}
