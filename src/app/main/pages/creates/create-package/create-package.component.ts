import { TranslateService } from '@ngx-translate/core';
import { DateUtils } from './../../../apps/reports/timesheets/timesheet-model';
import { Employee } from 'app/main/apps/employee/models/employee.model';
import { CreatePackageService } from './create-package.service';
import { Location, TitleCasePipe } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators, FormArray } from '@angular/forms';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { FuseConfirmDialogComponent } from '@fuse/components/confirm-dialog/confirm-dialog.component';
import { FuseProgressBarService } from '@fuse/components/progress-bar/progress-bar.service';
import { FuseUtils } from '@fuse/utils';
import { ALocation, AnkaGeoLocation } from 'app/main/apps/location/location.model';
import { User } from 'app/main/apps/user/user.model';
import { Observable, Subject } from 'rxjs';
import { map, startWith, takeUntil, tap } from 'rxjs/operators';
import { Guid } from 'guid-typescript';
import * as _ from 'lodash';
import { GooglePlaceDirective } from 'ngx-google-places-autocomplete';
import { Address } from 'ngx-google-places-autocomplete/objects/address';
import { CreatePropertyService } from '../create-property/create-property.service';
import { AutoCompleteOption } from 'app/main/ui/custom/figma-autocomplete/figma-autocomplete.component';
import * as moment from 'moment';
import { MatHorizontalStepper } from '@angular/material/stepper';

@Component({
  selector: 'app-create-package',
  templateUrl: './create-package.component.html',
  styleUrls: ['./create-package.component.scss'],
  animations: fuseAnimations,
  changeDetection: ChangeDetectionStrategy.OnPush,
  
  providers: [
    TitleCasePipe
  ]
})
export class CreatePackageComponent implements OnInit {
  @ViewChild('placesRef') placesRef: GooglePlaceDirective;

  mapOptions = {
    componentRestrictions: { country: 'CA' },
  };

  pageType: string = 'new';

  user: User;
  formType: string;
  isEditMode: boolean;
  isEditedPassword: boolean = false;
  supervisors: User[];
  location: ALocation;
  dialogRef: any;
  confirmDialogRef: MatDialogRef<FuseConfirmDialogComponent>;

  categories: any[];
  currentCategory: string = '';

  error: any;
  success: boolean = false;
  geolocation: AnkaGeoLocation;

  locationOptions: AutoCompleteOption[] = [];
  locationControl = new FormControl();

  employeeOptions: AutoCompleteOption[] = [];
  employeeControl = new FormControl();

  step1Form: FormGroup = new FormGroup({});
  horizontalStepperStep2: FormGroup;

  private _unsubscribeAll: Subject<any>;

  rList$: Observable<any> = new Observable();

  get recurrences() {
    return Array.from(new Array(20)).map((x,i) => i+1);
  }

  /**
   * Constructor
   *
   * @param {FormBuilder} _formBuilder
   * @param {Location} _location
   * @param {MatSnackBar} _matSnackBar
   */
  constructor(
    private _createPackageService: CreatePackageService,
    private _formBuilder: FormBuilder,
    private _fuseProgressBarService: FuseProgressBarService,
    public _matDialog: MatDialog,
    public _router: Router,
    public _location: Location,
    private _matSnackBar: MatSnackBar,
    private _translate: TranslateService,
    private _titlecase: TitleCasePipe,
    private cdr: ChangeDetectorRef
  ) {
    // this.reset();
    this._unsubscribeAll = new Subject();
  }

  ngOnInit(): void {
    this.initForm();
    // this.reset();
    this.fetchData();
  }

  fetchData() {
    this._createPackageService.onAllEmployeesChanged
    .pipe(takeUntil(this._unsubscribeAll))
    .subscribe((employees: Employee[]) => {

      this.employeeOptions = employees
        .map(emp => { return { viewValue: emp.fullName, value: emp} })
        .sort((a,b) => a.viewValue  > b.viewValue ? 1 : -1 );

      this.employeeControl.setValue(
        this.employeeOptions.length > 0 ? this.employeeOptions[0].value : ''
      );

      // console.log(this.employeeOptions);
    })

    this._createPackageService.onAllLocationsChanged
    .pipe(takeUntil(this._unsubscribeAll))
    .subscribe((locations) => {
      this.locationOptions = locations
        .map((item) => { return { viewValue: item.name, value: item._id}})
        .sort((a,b) => a.viewValue  > b.viewValue ? 1 : -1 );


      this.locationControl.setValue(
        this.locationOptions.length > 0 ? this.locationOptions[0].value : ''
      );
      
    });
  }


  initForm() {
    this.step1Form = this.getStep1Form();

    this.addDurationItem();

    // this.step1Form.valueChanges.subscribe(res => {
    //   
    // })

  }


  addPackage(): void {
    this._fuseProgressBarService.show();
    const data = this.step1Form.getRawValue();
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    
    const payloads: any[] = [];

    data.durationArray.forEach(durationItem => {
      payloads.push({
        location: data.location.value,
        employee: data.employee.value._id,
        recurrence: durationItem?.recurrence,
        timeStart: durationItem?.timeStart,
        countEntries: durationItem?.countEntries,
        timezone: tz
      })  
    });
    
    this.error = null;

    const promises: any[] = [];

    payloads.forEach(payload =>  promises.push(this._createPackageService.addPackage(payload)));

    Promise.all(promises)
      .then((userResponse) => {
        this.success = true;
      })
      .catch((error) => {
        this.error = error;
      })
      .finally(() => {
        this._fuseProgressBarService.hide();
      });
  }

  reset(stepper: MatHorizontalStepper) {
    this.success = false;
    this.error = null;

    stepper.reset();
    this.step1Form = this.getStep1Form();
    this.addDurationItem();
    this.cdr.detectChanges();
  }

  get durationArray(): FormArray {
    return this.step1Form.get("durationArray") as FormArray
  }

  private getStep1Form() {
    return this._formBuilder.group({
      employee: [ '', Validators.required],
      location: ['', Validators.required],
      durationArray: this._formBuilder.array([]),
      // date: [ today , Validators.required],
      // time: ['', Validators.required],
      // timeStart: [today, Validators.required],
      // countEntries: ['', Validators.required],
      // recurrence: ['', Validators.required],
    });
  }

  private getDurationItem() {
    const today = new Date(new Date().toDateString());
    return this._formBuilder.group({
      date: [ today , Validators.required],
      time: ['', Validators.required],
      timeStart: [today, Validators.required],
      countEntries: [1, Validators.required],
      recurrence: ['SINGLE', Validators.required],
      rList$: [ new Observable()]
    })
  }


  addDurationItem(index?) {
    let group = this.getDurationItem();

    // if (index == 0 || index > 0) {
    //   this.durationArray.insert(index,group)
    // } else {
      this.durationArray.push(group)
    // }
    group.get("date").valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(date => this.setDateTime(group));
    group.get("time").valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(time => this.setDateTime(group));
    
    this.setRListValues(group);
    this._translate.onLangChange.subscribe(res => {
      this.setRListValues(group);
    })
  }

  setRListValues(group: FormGroup) {
    group.get("rList$").setValue(
      group?.get("date")?.valueChanges?.pipe(
        startWith(""),
        map((res) => {
          const date = group.get("date").value; 
          const friendlyDay: string = (date ? (moment(date).format('dddd') || moment().format('dddd')) : moment().format('dddd')).toUpperCase();
          const translatedFriendlyDay =  this._titlecase.transform(`${this._translate.instant("COMMON." + friendlyDay)}`) ;
          const weekNumber = this.weekOfMonthByDay(moment(date));
          const translateOfWeekNumber: string = this.getTranslateFromCount(weekNumber);

          const lang = this._translate.currentLang;
          const dayNumber = lang == 'en' ? moment(date).format("Do") : moment(date).date();
          return  [
            { id: 1, viewValue: `${this._translate.instant('COMMON.DOES_NOT_REPEAT')}`, value: 'SINGLE'},
            { id: 2, viewValue: `${this._translate.instant('COMMON.DAILY')}`, value: 'DAILY'},
            { id: 3, viewValue: `${this._translate.instant('COMMON.WEEKLY_PACKAGE')} ${ translatedFriendlyDay}`, value: 'WEEKLY'},
            { id: 4, viewValue: `${this._translate.instant('COMMON.BI_WEEKLY_ON')} ${ translatedFriendlyDay}`, value: 'BI-WEEKLY'},
            { id: 5, viewValue: `${this._translate.instant('COMMON.MONTHLY_ON')} ${this._translate.instant(translateOfWeekNumber)} ${ translatedFriendlyDay}`, value: 'MONTHLY-DAY'},
            { id: 6, viewValue: `${this._translate.instant('COMMON.EVERY')} ${dayNumber} ${this._translate.instant('COMMON.OF_THE_MONTH')}`, value: 'MONTHLY'},
          ]
        })
      )
    );
  }
  
  removeDurationItem(index?) {
    if (index == 0 || index > 0) {
      this.durationArray.removeAt(index)
    } else {
      this.durationArray.removeAt(this.durationArray.controls.length - 1)
    }
  }
  
  private setDateTime(formGroup: AbstractControl) {
    const time = formGroup.get("time").value;
    const date = formGroup.get("date").value;

    let timeStart;

    if (date) {
      timeStart = moment(date);
    }
    if (time) {
      const times = time && time.split(":").length == 2 ? time.split(":") : ['0', '0'];
      
      timeStart = moment(date).add(times[0], 'hours').add(times[1], 'minutes');
    }
    formGroup.get("timeStart").setValue( moment(timeStart).toISOString() );
    
  }


  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }


  //#region  Util functions 
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
