import { DATE_FORMATS } from './../../../apps/reports/timesheets/timesheet-model';
import { PayrollService } from './../../../apps/reports/payrolls/payroll.service';
import { Component, EventEmitter, Injectable, Input, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import {
  MAT_DATE_RANGE_SELECTION_STRATEGY,
  DateRange,
  MatDateRangeSelectionStrategy,
} from '@angular/material/datepicker';
import { DateAdapter } from '@angular/material/core';
import { DateFrequency } from 'app/main/apps/reports/timesheets/timesheet-model';
import * as moment from 'moment';

@Injectable({
  providedIn: 'root',
})
export class DayRangeSelectionStrategy<D> implements MatDateRangeSelectionStrategy<D> {
  frequency: string;
  constructor(private _dateAdapter: DateAdapter<D>, private _payrollService: PayrollService) {}

  selectionFinished(date: D | null): DateRange<D> {
    return this._createDayRangeByFrequency(date);
  }

  createPreview(activeDate: D | null): DateRange<D> {
    return this._createDayRangeByFrequency(activeDate);
  }

  private _createDayRangeByFrequency(date: D | null): DateRange<D> {
    const frequency = this._payrollService.frequency;

    if (date && frequency) {
      let start = this._dateAdapter.addCalendarDays(date, 0);
      let end = this._dateAdapter.addCalendarDays(date, DateFrequency.BI_WEEK_COUNT);

      if (frequency && frequency == DateFrequency.BI_WEEKLY) {
        // start = <any>moment(date).startOf("week") ;
        // end = <any>moment(date).add(1, 'weeks').endOf("week") ;
        start = <any>moment(date).startOf("week") ;
        end = <any>moment(date).add(1, 'weeks').endOf("week") ;

      } else if (frequency && frequency == DateFrequency.WEEKLY) {
        // end = this._dateAdapter.addCalendarDays(date, DateFrequency.WEEK_COUNT);
        // end = this._dateAdapter.addCalendarDays(<any>moment(date).startOf("week"),0) ;
        start = <any>moment(date).startOf("week") ;
        end = <any>moment(date).endOf("week") ;
      }

      return new DateRange<D>(start, end);
    }

    return new DateRange<any>(null, null);

  }
}
@Component({
  selector: 'figma-auto-range-datepicker',
  templateUrl: './figma-auto-range-datepicker.component.html',
  styleUrls: ['./figma-auto-range-datepicker.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [
    {
      provide: MAT_DATE_RANGE_SELECTION_STRATEGY,
      useClass: DayRangeSelectionStrategy,
    },
  ],
})
export class FigmaAutoRangeDatepickerComponent implements OnInit {
  @Input('required') required: boolean = false;

  @Input('range') range: FormGroup = new FormGroup({
    start: new FormControl(),
    end: new FormControl(),
  });

  @Output('closed') closed = new EventEmitter<any>();

  constructor() {}

  ngOnInit(): void {}

  onClose() {
    this.closed.emit(this.range.value);
  }
}
