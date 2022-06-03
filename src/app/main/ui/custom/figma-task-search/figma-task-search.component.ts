import { Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { FormControl } from '@angular/forms';
import { fuseAnimations } from '@fuse/animations';
import { ScheduleService } from 'app/main/apps/schedule/figma.service';
import { TaskService } from 'app/main/apps/task/figma.service';
import * as moment from 'moment';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, skip, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-figma-task-search',
  templateUrl: './figma-task-search.component.html',
  styleUrls: ['./figma-task-search.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations,
})
export class FigmaTaskSearchComponent implements OnInit {
  @Output() searchChanged: EventEmitter<any>;

  @Input() banner: any;
  placeholder = 'Select month';
  today: Date = new Date();
  sixMonthsAgo: Date = new Date();
  sixMonthsFuture: Date = new Date();
  searchInput: FormControl;


  // searchInput: FormControl;
  // dateRangeStartInput: FormControl;
  // dateRangeEndInput: FormControl;

  private _unsubscribeAll: Subject<any>;
  constructor(private _taskService: TaskService) { 
  //  this.searchInput = new FormControl('');
   this.searchChanged = new EventEmitter();
   this._unsubscribeAll = new Subject();
  }

  ngOnInit(): void {
    // this.searchInput = new FormControl('');
    this.today = new Date();
    this.sixMonthsAgo = new Date();
    this.sixMonthsAgo.setMonth(this.today.getMonth() - 6);
    this.sixMonthsFuture.setMonth(this.today.getMonth() + 6);

    const year = moment(this.today).format('YYYY');
    const month = moment(this.today).format('MM');
    this.placeholder = `${month} / ${year}`;

    // Set the defaults
    this.searchInput = new FormControl('');
    var today = new Date(); //'Mar 11 2015' current.getTime() = 1426060964567
    var tomorrow = new Date(today.getTime() + 86400000); // + 1 day in ms
    tomorrow.toLocaleDateString();
    // const filters = this._scheduleService.getCurrentFilters();
    // this.dateRangeStartInput = new FormControl(
    //   filters.dateRangeStart ? filters.dateRangeStart : new Date()
    // );
    // this.dateRangeEndInput = new FormControl(
    //   filters.dateRangeEnd ? filters.dateRangeEnd : new Date()
    // );

    // this.searchInput.valueChanges
    //   .pipe(takeUntil(this._unsubscribeAll), debounceTime(300), distinctUntilChanged())
    //   .subscribe((searchText) => {
    //     this._scheduleService.searchTextChange(searchText);
    //   });

    // this.dateRangeStartInput.valueChanges
    //   .pipe(skip(1), takeUntil(this._unsubscribeAll), debounceTime(300), distinctUntilChanged())
    //   .subscribe(() => {
    //     const dateRangeEnd = this.dateRangeEndInput ? this.dateRangeEndInput.value : new Date();
    //     this._scheduleService.onDateRangeEndChanged.next(dateRangeEnd); // used for excel error
    //   });

    // this.dateRangeEndInput.valueChanges
    //   .pipe(skip(1), takeUntil(this._unsubscribeAll), debounceTime(300), distinctUntilChanged())
    //   .subscribe((end) => {
    //     if (!end) {
    //       return;
    //     }
    //     const dateRangeStart = this.dateRangeStartInput
    //       ? this.dateRangeStartInput.value
    //       : new Date();
    //     const dateRangeEnd = this.dateRangeEndInput ? this.dateRangeEndInput.value : new Date();

    //     this._scheduleService.setFilterDateRangeStart(dateRangeStart);
    //     this._scheduleService.setFilterDateRangeEnd(dateRangeEnd);
    //     this._scheduleService.getAllDataSchedulesByLocationId(
    //       // this.banner.client?.locations[0]._id ? this.banner.client?.locations[0]._id : null
    //     );
    //     this._scheduleService.onDateRangeEndChanged.next(dateRangeEnd); // used for excel error
    //   });

  }

  openDatePicker(dp) {
    dp.open();
  }

  closeDatePicker(eventData: any, dp?: any) {
    const year = moment(eventData).format('YYYY');
    const month = moment(eventData).format('MM');
    this.placeholder = `${month} / ${year}`;
    // get month and year from eventData and close datepicker, thus not allowing user to select date
    dp.close();

    this._taskService.getAllDataTasks({
      year,
      month,
      propertyId: this.banner?.client?._id,
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
