import { ApiCallDispatchers } from './../../../../store/states/api-call/api-call.dispatchers';
import { UtilService } from './../../../../store/services/util.service';
import { CreatePackageService } from './../create-package/create-package.service';
import * as moment from 'moment';
import { IRuleOptions, IScheduleArgs, Schedule } from "./rschedule";

import { TitleCasePipe } from '@angular/common';
import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { fuseAnimations } from '@fuse/animations';
import { FuseProgressBarService } from '@fuse/components/progress-bar/progress-bar.service';
import { Subject } from 'rxjs';
import * as _ from 'lodash';
import { AutoCompleteOption } from 'app/main/ui/custom/figma-autocomplete/figma-autocomplete.component';
import { MatHorizontalStepper } from '@angular/material/stepper';
import { LocationStateService } from 'app/store/states/location/location-state.service';
import { ApiCallStateService } from 'app/store/states/api-call/api-call-state.service';
import { ViewSelectSnapshot } from '@ngxs-labs/select-snapshot';
import { LocationSelectors } from 'app/store/states/location/location.selectors';
import { EmployeeSelectors } from 'app/store/states/employee/employee.selectors';
import { EmployeeDispatchers } from 'app/store/states/employee/employee.dispatchers';
import { LocationDispatchers } from './../../../../store/states/location/location.dispatchers';
import { TranslateService } from '@ngx-translate/core';
import { DateUtils } from 'app/main/apps/reports/timesheets/timesheet-model';
import { TimeSheetEntity } from 'app/store/states/timesheet/timesheet-state.model';
import { TimeSheetDispatchers } from 'app/store/states/timesheet/timesheet.dispatchers';
import { AddMultiplePackages } from 'app/store/states/timesheet/timesheet.actions';

interface WeeksInterface {
  id: number;
  weekday: number;
  checked: boolean;
  time: string;
  value: string;
  viewValue: string;
}

@Component({
  selector: 'app-create-package-new',
  templateUrl: './create-package-new.component.html',
  styleUrls: ['./create-package-new.component.scss'],
  animations: fuseAnimations,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    TitleCasePipe
  ]
})
export class CreatePackageNewComponent implements OnInit {


  @ViewSelectSnapshot(LocationSelectors.locationAutoCompleteOptions) locationOptions: AutoCompleteOption[];
  @ViewSelectSnapshot(EmployeeSelectors.employeeAutoCompleteOptions) employeeOptions: AutoCompleteOption[];

  schedule: Schedule;
  rruleOptions: IRuleOptions[];

  momentObj = moment;
  
  get result() {
    const res = this.schedule?.occurrences()?.toArray()?.map(({ date }) => {

      date = date.startOf('day');
      // handle all recurrence type before adding time to the date. 


      if (this.activeRecurrence == 'DAILY' || this.activeRecurrence == 'MONTHLY') {
        const time = this.form.get('punchInTime').value;
        date = this.setTimeToDate(date, time);     
      }

      if (this.activeRecurrence == 'WEEKLY') {
        const currWeeks: WeeksInterface[] = this.form.get('weekly.weeks').value;
        const targetDate = currWeeks.find(x => x.weekday == date.weekday())
        if (targetDate.time) {
          date = this.setTimeToDate(date, targetDate.time);
        }
      }


      return date.toString()
    });

    return res ? res : [];
  }

  get activeRecurrence() {
    return this.form.get('recurrence').value;
  }

  error: any;
  success: boolean = false;

  form: FormGroup = new FormGroup({});

  endRadioBtnSelections = [
    { id: 1, checked: true, value: 'endDate'},
    { id: 2, checked: false, value: 'occurrence'},
  ]
  endSelection = new FormControl(this.endRadioBtnSelections[0].value);
  monthlyRadioBtnSelections = [
    { id: 1, checked: true, value: 'byDayCount'},
    { id: 2, checked: false, value: 'byDay'},
  ]
  monthlySelection = new FormControl(this.monthlyRadioBtnSelections[0].value);

  horizontalStepperStep2: FormGroup;
  private _unsubscribeAll: Subject<any>;

  get repeats() { return this.getcount(20) }

  constructor(
    private _createPackageService: CreatePackageService,
    private _formBuilder: FormBuilder,
    private _fuseProgressBarService: FuseProgressBarService,
    private cdr: ChangeDetectorRef,
    public loc: LocationStateService,
    private _translate: TranslateService,
    private _titlecase: TitleCasePipe,
    public apiCall: ApiCallStateService,
    private util: UtilService,
  ) {
    this._unsubscribeAll = new Subject();
  }

  ngOnInit(): void {
    this.initForm();
    this.fetchData();
  }

  fetchData() {
    EmployeeDispatchers.fetchAllEmployees();
    LocationDispatchers.fetchAllLocations();
  }

  //#region  Form logic

  initForm() {
    this.form = this.getForm();

    /* setting the schedules by default value */
    this.updateSchedule();

    // changing the dropdown values based on the language change.
    this.setRListValues(this.form);
    this._translate.onLangChange.subscribe(res => {
      this.setRListValues(this.form);
      this.form.get('weekly.weeks').setValue(this.getWeeks());
      this.form.get('monthly.allWeeks').setValue(this.getWeeks());
      this.form.get('monthly.dayOfMonths').setValue(this.getDayOfMonthNames());
    })

    this.handleFormValueChanges();

    this.handleEnableDisableControls();
  }

  setTimeToDate(date, time: string) {
    if (time) {
      const times = time && time.split(":").length == 2 ? time.split(":") : ['0', '0'];
      
      date = moment(date).startOf('day');
      date = moment(date).add(times[0], 'hours').add(times[1], 'minutes');
    } 
    return date;
  }

  handleFormValueChanges() {
    this.form.valueChanges.subscribe(res => {

      this.updateSchedule();

    });


    this.form.get('startDate').valueChanges.subscribe(startDate => {
        const endDate = this.form.get('endDate').value;
        // if endDate is smaller than startDate make it startDate or else do nothing
        if (moment(endDate) < moment(startDate)) {
          this.form.get('endDate').setValue(startDate);
        }
    })

  }

  handleEnableDisableControls() {
    this.endSelection.valueChanges.subscribe(res => {
      if (res == 'endDate') {
        this.form.get("occurrence").disable();
        this.form.get("endDate").enable();
      }
      if (res == 'occurrence') {
        this.form.get("occurrence").enable();
        this.form.get("endDate").disable();
      }
    })
    this.monthlySelection.valueChanges.subscribe(res => {
      if (res == 'byDayCount') {
        this.form.get("monthly.byDayCount").enable();
        
        this.form.get("monthly.dayName").disable();
        this.form.get("monthly.weekDay").disable();
      }
      if (res == 'byDay') {
        this.form.get("monthly.byDayCount").disable();
        
        this.form.get("monthly.dayName").enable();
        this.form.get("monthly.weekDay").enable();
      }
    })
  }

  updateSchedule() {

    this.rruleOptions = this.calculateRuleOptions();

    const options: IScheduleArgs = {
      rrules: this.rruleOptions,
      timezone: this.util.timezone
    } 

    this.schedule = new Schedule(options);
    
    console.log(this.result);
  }

  /**
   * @input form value
   * @returns options from the value of form
   */
  private calculateRuleOptions() {
    const {startDate, endDate, repeatEvery, recurrence, occurrence, monthly, weekly } = this.form.getRawValue();

    let ruleOptions: Partial<IRuleOptions> = {};

    recurrence ? ruleOptions.frequency = recurrence : ruleOptions.frequency = 'DAILY';
    startDate ? ruleOptions.start = moment(startDate) : ruleOptions.start = moment(DateUtils.today);
    repeatEvery ? ruleOptions.interval = repeatEvery : '';

    // if end selection is date or occurence count => set the options occordingly 
    if (this.endSelection.value == 'endDate') {
      endDate ? ruleOptions.end = moment(endDate).endOf("day") : '';
    }
    if (this.endSelection.value == 'occurrence') {
      occurrence ? ruleOptions.count = occurrence : '';
    }

    /// handle weekly
    if (recurrence == 'WEEKLY') {
      if (weekly.weeks) {
        const out = weekly.weeks.filter(x => x.checked).map(x => x.value);
        out && out.length > 0 ? ruleOptions.byDayOfWeek  = out : '';
      }
    }

    // handle monthly 
    if (recurrence == 'MONTHLY') {
      if (this.monthlySelection.value == 'byDayCount') {
        monthly?.byDayCount ? ruleOptions.byDayOfMonth = [monthly?.byDayCount]  : '';
      }

      if (this.monthlySelection.value == 'byDay') {
        
        monthly?.weekDay &&  monthly?.dayName ? ruleOptions.byDayOfWeek = [ [ monthly.weekDay, monthly.dayName]] : '';
      }

    }



    return <IRuleOptions[]>[ruleOptions];
  }

  private getForm() {
    return this._formBuilder.group({
      employee: ['', Validators.required],
      location: ['', Validators.required],
      startDate: [ DateUtils.today , Validators.required],
      recurrence: ['DAILY', Validators.required],

      // timeStart: [today, Validators.required],
      repeatEvery: [ 1, Validators.required],
      
      endDate: [ { value: DateUtils.today, disabled: false}],
      occurrence: [{ value: 1, disabled: true}],
      
      punchInTime: ['00:00'],


      weekly: this._formBuilder.group({
        weeks: [ this.getWeeks()]
      }),

      monthly : this._formBuilder.group({
        byDayCount: [this.getcount(31)[0]],

        dayName: [ this.getDayOfMonthNames()[0].id ], // 1, 2, 3, 4, -1
        weekDay: [ this.getWeeks()[0].value ], // MO,TU

        //-------------------------------//
        // raw data
        dayCounts: [this.getcount(31) ] ,
        dayOfMonths: [ this.getDayOfMonthNames() ],
        allWeeks: [ this.getWeeks() ]

      }),

      rList: [ [] ]
    });
  }

  private setRListValues(group: FormGroup) {
    group.get("rList").setValue(
      [
        { id: 1, viewValue: `${this._translate.instant('COMMON.DAILY')}`, value: 'DAILY'},
        { id: 2, viewValue: `${this._translate.instant('COMMON.WEEKLY')}`, value: 'WEEKLY'},
        { id: 3, viewValue: `${this._translate.instant('COMMON.MONTHLY')}`, value: 'MONTHLY'},
      ]
    );
  }

  //#endregion

  onNext() {
    
    console.log(this.form);
    if (this.form.invalid) {
      console.log(this.form.errors);
    }
    ApiCallDispatchers.resetState(AddMultiplePackages.type);

  }


  addPackage(): void {
    console.log(this.form);
    if (this.form.invalid) {
      console.log(this.form.errors);
    }

    const occurences = this.result;

    const payload: TimeSheetEntity[] = occurences.map(occurence => {
      const start = moment(occurence).toISOString() ;
      const end = moment(start).add(2, 'hours').toISOString() 

      const { employee, location } = this.form.getRawValue();

      const obj = {
        status: 'PACKAGE',
        employee: employee.value,
        location: location.value,
        isActive: true,
        timeStart: start,
        timeEnd: end,

        punchIn: null,
        punchOut: null,
        punchInStatus: 'UNKNOWN',
        punchOutStatus: 'UNKNOWN',
        alertStoppedPunchIn: null,
        alertStoppedPunchOut: null,
        timezone: this.util.timezone,
      };
      return new TimeSheetEntity(obj);
    })

    TimeSheetDispatchers.AddMultiplePackages(payload);
  }


  reset(stepper: MatHorizontalStepper) {
    // this.success = false;
    // this.error = null;
    ApiCallDispatchers.resetState(AddMultiplePackages.type);

    stepper.reset();
    this.initForm();
    this.cdr.detectChanges();
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }


  //#region  Util functions 

  private getcount(num) {
    return Array.from(new Array(num)).map((x,i) => i+1);
  }

  private getWeeks(): WeeksInterface[] {
    return [
      { id: 0, weekday: 0, checked: false, time: '00:00', value: 'SU', viewValue: `${this._translate.instant('COMMON.SUNDAY')}` }, 
      { id: 1, weekday: 1, checked: false, time: '00:00', value: 'MO', viewValue: `${this._translate.instant('COMMON.MONDAY')}` }, 
      { id: 2, weekday: 2, checked: false, time: '00:00', value: 'TU', viewValue: `${this._translate.instant('COMMON.TUESDAY')}` }, 
      { id: 3, weekday: 3, checked: false, time: '00:00', value: 'WE', viewValue: `${this._translate.instant('COMMON.WEDNESDAY')}` }, 
      { id: 4, weekday: 4, checked: false, time: '00:00', value: 'TH', viewValue: `${this._translate.instant('COMMON.THURSDAY')}` }, 
      { id: 5, weekday: 5, checked: false, time: '00:00', value: 'FR', viewValue: `${this._translate.instant('COMMON.FRIDAY')}` }, 
      { id: 6, weekday: 6, checked: false, time: '00:00', value: 'SA', viewValue: `${this._translate.instant('COMMON.SATURDAY')}` }
    ];  
  }

  private getDayOfMonthNames() {
    return [
      { id: 1,   viewValue: this._translate.instant('COMMON.FIRST') },
      { id: 2,   viewValue: this._translate.instant('COMMON.SECOND') },
      { id: 3,   viewValue: this._translate.instant('COMMON.THIRD') },
      { id: 4,   viewValue: this._translate.instant('COMMON.FORTH') },
      { id: -1,  viewValue: this._translate.instant('COMMON.LAST') }
    ]
  }

  private weekOfMonth (input = moment()) {
    const firstDayOfMonth = input.clone().startOf('month');
    const firstDayOfWeek = firstDayOfMonth.clone().startOf('week');
  
    const offset = firstDayOfMonth.diff(firstDayOfWeek, 'days');
  
    return Math.ceil((input.date() + offset) / 7);
  }

  private weekOfMonthByDay(date = moment()) {
    const weekNumber = this.weekOfMonth(moment(date));

    const startOfMonthDayNumber = moment(date).startOf("month").day();
    const selectedDateDayNumber = moment(date).day();
    let rightWeekNumber = weekNumber;
    if (startOfMonthDayNumber > selectedDateDayNumber ) {
      rightWeekNumber = weekNumber - 1;
    }
    return rightWeekNumber;
  }

  private getTranslateFromCount(number: number) {
    return number == 1 ? 'COMMON.FIRST':
    number == 2 ? 'COMMON.SECOND':
    number == 3 ? 'COMMON.THIRD':
    number == 4 ? 'COMMON.FORTH':
    number == 5 ? 'COMMON.FIFTH':
    'COMMON.FIRST'
  }

  //#endregion

}

