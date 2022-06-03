import {
  AfterViewInit,
  Component,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
  ViewChildren,
  ViewEncapsulation,
} from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, NgForm, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { FuseConfirmDialogComponent } from '@fuse/components/confirm-dialog/confirm-dialog.component';
import { FuseProgressBarService } from '@fuse/components/progress-bar/progress-bar.service';
import { FusePerfectScrollbarDirective } from '@fuse/directives/fuse-perfect-scrollbar/fuse-perfect-scrollbar.directive';
import { MultiSelectionItem } from 'app/main/ui/custom/multiple-selection/multiple-selection.component';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Employee } from '../../../models/employee.model';
import { UserService } from '../../../figma.service';
import * as moment from 'moment';
import { MomentInput } from 'moment';
import { RecommendedTime } from '../../../models/recommended-time.model';
import { FutureTimesheetResponse } from '../../../models/future-timesheet-response.model';
import { TranslateService } from '@ngx-translate/core';

export interface SingleSelectionItem {
  id: string;
  name: string;
  selected: boolean;
}

@Component({
  selector: 'figma-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class FigmaDetailComponent implements OnInit, OnDestroy, AfterViewInit {
  @Output() deselect: EventEmitter<any> = new EventEmitter();
  @ViewChild(FusePerfectScrollbarDirective)
  directiveScroll: FusePerfectScrollbarDirective;

  @ViewChildren('replyInput')
  replyInputField;

  @ViewChild('replyForm')
  replyForm: NgForm;

  employee: Employee = null;
  tags: any[];
  formType: string;
  employeeForm: FormGroup;
  isEditMode: boolean;
  isMobileAppEnabled: boolean;
  error: any = null;
  dialogRef: any;
  confirmDialogRef: MatDialogRef<FuseConfirmDialogComponent>;
  supervisors: Employee[];
  bannerOptions: string[] = [];
  filteredOptions: Observable<string[]>;
  bannerControl = new FormControl();

  _unsubscribeAll: Subject<any>;

  offs = [
    'COMMON.SAT',
    'COMMON.SUN',
    'COMMON.MON',
    'COMMON.TUE',
    'COMMON.WED',
    'COMMON.THU',
    'COMMON.FRI',
  ];
  times: RecommendedTime[] = [];
  classes = ['A', 'B', 'A+B'];
  regions = ['MONTREAL', 'QUEBEC', 'ONTARIO'];
  types = ['COMMON.EMPLOYE', 'COMMON.CONTRACTOR', 'COMMON.UNKNOWN'];
  selectedType = '';
  figma: any;
  dialog: any;
  contact: any;
  replyInput: any;

  errorMatricule: string = 'Matricule est requis';
  matricules: string[] = [];

  singleLocationSelections: SingleSelectionItem[] = [];
  singleLocationSelected: string = '';
  singleLocationControl: FormControl = new FormControl('');
  horizontalStepperStep2: FormGroup;

  locationsFormControl = new FormControl();
  locationSelections: MultiSelectionItem[] = [];
  locationsSelected: string[] = [];
  locationsSelectedName: string[] = [];

  days = [
    'COMMON.SUNDAY',
    'COMMON.MONDAY',
    'COMMON.TUESDAY',
    'COMMON.WEDNESDAY',
    'COMMON.THURSDAY',
    'COMMON.FRIDAY',
    'COMMON.SATURDAY',
  ];

  minTerminationDate: moment.Moment;
  maxTerminationDate: moment.Moment;
  eventDate: MomentInput;

  constructor(
    private _figmaService: UserService,
    private _formBuilder: FormBuilder,
    private _fuseProgressBarService: FuseProgressBarService,
    public _matDialog: MatDialog,
    public _router: Router,
    private _matSnackBar: MatSnackBar,
    public translate: TranslateService
  ) {
    this._unsubscribeAll = new Subject();
  }

  ngOnInit(): void {
    this.minTerminationDate = moment().subtract(1, 'months');
    this.maxTerminationDate = moment().add(1, 'months');

    this.loadPrerequisites();

    for (var i = 0; i < 7; i++) {
      this.times[i] = {
        isSelectorOpen: false,
      };
    }

    this._figmaService.onAllEmployeesChanged
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((employees: Employee[]) => {
        this.matricules = employees.map((item) => {
          return item.matricule;
        });
      });

    this._figmaService.onCurrentFigmaChanged
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((figmaData) => {
        if (!!figmaData) {
          
          this.employee = figmaData;
          this.formType = 'edit';

          this.employeeForm = this.createEmployeeForm();
          this.selectedType = this.employee.type == 'EMPLOYEE' ? 'COMMON.EMPLOYE' : '';
          this.classes = this.selectedType === 'COMMON.EMPLOYE' ? ['A', 'B', 'A+B'] : ['NA'];

          // subscribe to changes in type
          this.employeeForm.controls['type'].valueChanges.subscribe((value) => {
            this.selectedType = value;
            this.classes = value === 'COMMON.EMPLOYE' ? ['A', 'B', 'A+B'] : ['NA'];

            let classValue = value === 'COMMON.EMPLOYE' 
                                        ? this.employee.class == 'AB' ? 'A+B' 
                                        : this.employee.class == 'NA' ? '' : this.employee.class 
                                        : 'NA';

            this.employeeForm.patchValue({
              class: classValue
            });
          });

          this.horizontalStepperStep2 = this._formBuilder.group({
            temp: this._formBuilder.control(''),
          });
        }
      });

    this._figmaService.onLocationsChanged
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((locations) => {
        if (!!locations) {
          this.locationSelections = locations.map((item) => {
            const foundItems = this.employee.locations?.filter((locItem) => {
              return locItem._id === item._id;
            });
            return {
              id: item._id,
              name: item.name,
              selected: !!foundItems && foundItems.length > 0 ? true : false,
            };
          });

          this.locationsSelected = this.locationSelections
            .filter((item) => !!item.selected)
            .map((item) => item.id);

          this.locationsSelectedName = this.locationSelections
            .filter((item) => {
              return this.locationsSelected.includes(item.id);
            })
            .map((item) => {
              return item.name;
            });

          this.createTimeFormControls(this.employee.times);
          this.initializeSingleLocationSelections();

          this.employeeForm.patchValue({
            location: this.employee.location?._id ? this.employee.location._id : '',
          });
        }
      });
  }

  ngAfterViewInit(): void {}

  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }

  loadPrerequisites() {
    this._figmaService.getAllEmployees();
  }

  onLocationSelectedChange(event: any): void {
    this.locationsSelected = event.value;
    this.locationsSelectedName = this.locationSelections
      .filter((item) => {
        return this.locationsSelected.includes(item.id);
      })
      .map((item) => {
        return item.name;
      });

    // // set the time locations based on the initially selected locations
    this.singleLocationSelections = this.locationSelections.filter((item) => {
      return this.locationsSelected.includes(item.id);
    });

    this.updateTimeFormControls(this.singleLocationSelections);
  }

  initializeSingleLocationSelections() {
    // set the time locations based on the initially selected locations
    this.singleLocationSelections = this.locationSelections.filter((item) => {
      return this.locationsSelected.includes(item.id);
    });

    this.singleLocationSelected =
      this.singleLocationSelections.length > 0 ? this.singleLocationSelections[0].id : '';

    if (this.locationsSelected.length > 0) {
      this.singleLocationSelected = this.locationsSelected[0];
      this.singleLocationControl.patchValue(this.singleLocationSelected);
    } else {
      this.singleLocationSelected = '';
      this.singleLocationControl.patchValue('');
    }
  }

  onLocationSelectedForTimeChange(item: any): void {
    if (!!item && !!item.value) {
      this.singleLocationSelected = item.value;
      return;
    }
    this.singleLocationSelected = '';
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.bannerOptions.filter((option) => {
      return option.toLowerCase().includes(filterValue);
    });
  }

  shouldShowContactAvatar(message, i): boolean {
    return (
      message.who === this.contact.id &&
      ((this.dialog[i + 1] && this.dialog[i + 1].who !== this.contact.id) || !this.dialog[i + 1])
    );
  }

  isFirstMessageOfGroup(message, i): boolean {
    return i === 0 || (this.dialog[i - 1] && this.dialog[i - 1].who !== message.who);
  }

  isLastMessageOfGroup(message, i): boolean {
    return (
      i === this.dialog.length - 1 || (this.dialog[i + 1] && this.dialog[i + 1].who !== message.who)
    );
  }

  selectContact(): void {
    // ken : this triggers the right-drawer
    this._figmaService.selectContact(this.contact);
  }

  readyToReply(): void {
    setTimeout(() => {
      this.focusReplyInput();
      this.scrollToBottom();
    });
  }

  focusReplyInput(): void {
    setTimeout(() => {
      this.replyInput.focus();
    });
  }

  scrollToBottom(speed?: number): void {
    speed = speed || 400;
    if (this.directiveScroll) {
      this.directiveScroll.update();

      setTimeout(() => {
        this.directiveScroll.scrollToBottom(0, speed);
      });
    }
  }
  reply(event): void {}

  createEmployeeForm(): FormGroup {
    return this._formBuilder.group({
      id: [this.employee._id],
      first: [
        {
          value: this.employee.first,
          disabled: false,
        },
        [Validators.required, Validators.minLength(3)],
      ],
      last: [
        {
          value: this.employee.last,
          disabled: false,
        },
        [Validators.required, Validators.minLength(3)],
      ],
      currentHours: [
        {
          value: this.employee?.currentHours,
          disabled: true,
        },
        [],
      ],
      initialHours: [
        {
          value: this.employee?.initialHours,
          disabled: false,
        },
        [],
      ],
      hireDateStart: [
        {
          value: this.employee.hireDateStart ? this.employee.hireDateStart : new Date(),
          disabled: false,
        },
        [Validators.required, Validators.minLength(3)],
      ],
      hireDateEnd: [
        {
          value: this.getUiHiredDate(this.employee.hireDateEnd),

          disabled: false,
        },
        [],
      ],
      tenurePermanent: [
        {
          value: this.employee.tenurePermanent ? this.employee.tenurePermanent : null,
          disabled: false,
        },
        [],
      ],
      isMobileAppEnabled: [
        {
          value: this.employee.isMobileAppEnabled,
          disabled: false,
        },
        [],
      ],
      matricule: [
        {
          value: this.employee.matricule,
          disabled: false,
        },
        [Validators.required, Validators.minLength(3)],
      ],
      email: [
        {
          value: !!this.employee.user && !!this.employee.user.email ? this.employee.user.email : '',
          disabled: false,
        },
        [],
      ],
      class: [
        {
          value: this.employee.class ? this.employee.class == 'AB' ? 'A+B' : this.employee.class : '',
          disabled: false,
        },
        [Validators.required, Validators.minLength(1)],
      ],
      region: [
        {
          value: this.employee.region ? this.employee.region : 'MONTREAL',
          disabled: false,
        },
        [Validators.required, Validators.minLength(1)],
      ],
      type: [
        {
          value: this.employee.type
            ? this.getTranslableEmployeeType(this.employee.type)
            : 'UNKNOWN',
          disabled: false,
        },
        [Validators.required, Validators.minLength(1)],
      ]
    });
  }

  focusTitleField(): void {
    setTimeout(() => {});
  }

  editEmployee(): void {
    this.error = null;

    const rawEmployee = this.employeeForm.getRawValue();
    const rawEmployeeSchedules = this.horizontalStepperStep2.getRawValue();

    const times = [];
    for (const [key, value] of Object.entries(rawEmployeeSchedules)) {
      times.push({
        key,
        value,
      });
    }

    
    let payload: any = { id: rawEmployee.id };

    if (this.employee.first !== rawEmployee.first) {
      payload.first = rawEmployee.first;
    }

    if (this.employee.last !== rawEmployee.last) {
      payload.last = rawEmployee.last;
    }

    if (this.employee.hireDateStart !== rawEmployee.hireDateStart) {
      payload.hireDateStart = rawEmployee.hireDateStart;
    }

    if (this.employee.hireDateEnd !== rawEmployee.hireDateEnd) {
      const HIRE_DATE_END_DELTA = 365 * 24 * 60 * 60 * 1000 * 100;
      payload.hireDateEnd = !!rawEmployee.hireDateEnd
        ? rawEmployee.hireDateEnd
        : moment(Date.now() + HIRE_DATE_END_DELTA);
    }

    payload.locations = this.locationsSelected;

    if (this.employee.class !== rawEmployee.class) {
      payload.class = rawEmployee.class == 'A+B' ? 'AB' : rawEmployee.class ;
    }

    if (this.employee.region !== rawEmployee.region.toUpperCase()) {
      payload.region = rawEmployee.region.toUpperCase();
    }

    if (this.employee.matricule !== rawEmployee.matricule) {
      payload.matricule = rawEmployee.matricule;
    }

    if (this.employee.user.email !== rawEmployee.email) {
      payload.email = rawEmployee.email;
    }

    if (this.employee.type !== rawEmployee.type) {
      payload.type = this.getRawEmployeeType(rawEmployee.type);
    }

    if (this.employee.isMobileAppEnabled !== rawEmployee.isMobileAppEnabled) {
      payload.isMobileAppEnabled = rawEmployee.isMobileAppEnabled;
    }

    if (JSON.stringify(this.employee.times) !== JSON.stringify(times)) {
      payload.times = times;
    }

    if (!!payload.isMobileAppEnabled && (!!!rawEmployee.email || rawEmployee.email === '')) {
      this.error = 'Employee email missing.';
      return;
    }

    const { isValid, error } = this.validateDate(
      rawEmployee.hireDateStart,
      rawEmployee.tenurePermanent
    );

    if (!isValid) {
      this.error = error;
      return;
    }

    if (this.employee.tenurePermanent !== rawEmployee.tenurePermanent) {
      payload.tenurePermanent = !!rawEmployee.tenurePermanent ? rawEmployee.tenurePermanent : '';
    }

    if (this.employee.initialHours !== rawEmployee.initialHours) {
      payload.initialHours = !!rawEmployee.initialHours ? rawEmployee.initialHours : '';
    }


    this.error = null;
    this._fuseProgressBarService.show();
    this._figmaService
      .updateEmployee(payload)
      .then((response) => {
        this.isEditMode = false;
        this.employeeForm.reset();
        this._figmaService.setSelected(null);
        this.deselect.emit();
        this._matSnackBar.open('Employee updated successfully.', 'OK', {
          verticalPosition: 'top',
          duration: 2000,
        });
      })
      .catch((error) => {
        this.error = error;
      })
      .finally(() => {
        this._fuseProgressBarService.hide();
      });
  }

  resetPassword(): void {
    this.error = null;

    const rawEmployee = this.employeeForm.getRawValue();

    if (!!!this.employee.user || !!!this.employee.user._id) {
      this.error = 'Employee user id missing.';
      return;
    }

    if (!!!rawEmployee.isMobileAppEnabled) {
      this.error = 'Employee is not mobile enabled.';
      return;
    }

    if (!!!rawEmployee.email || rawEmployee.email === '') {
      this.error = 'Employee email missing.';
      return;
    }

    this.error = null;
    this._fuseProgressBarService.show();
    this._figmaService
      .resetPassword(this.employee.user._id, this.employee.matricule)
      .then((response) => {
        this._matSnackBar.open('Employee password reset successfully.', 'OK', {
          verticalPosition: 'top',
          duration: 2000,
        });
      })
      .catch((error) => {
        this.error = error;
      })
      .finally(() => {
        this._fuseProgressBarService.hide();
      });
  }

  getRawEmployeeType(translatableType: String) {
    if (translatableType === 'COMMON.EMPLOYE') {
      return 'EMPLOYEE';
    } else if (translatableType === 'COMMON.CONTRACTOR') {
      return 'CONTRACTOR';
    } else {
      return 'UNKNOWN';
    }
  }

  getTranslableEmployeeType(employeeValue: string) {
    if (employeeValue === 'EMPLOYEE') {
      return 'COMMON.EMPLOYE';
    } else if (employeeValue === 'CONTRACTOR') {
      return 'COMMON.CONTRACTOR';
    } else {
      return 'COMMON.UNKNOWN';
    }
  }

  getUiHiredDate(date: string) {
    const currDate = moment();
    const eventDate = moment(date);
    let diff = eventDate.diff(currDate, 'days');

    if (!!!date || !moment(date, moment.ISO_8601, true).isValid() || diff > 30) {
      return '';
    }
    return date;
  }

  onClickDeleteEmployee(): void {
    this._fuseProgressBarService.show();
    this._figmaService
      .checkFutureTimesheets(this.employee._id)
      .then((response: FutureTimesheetResponse) => {
        if (!!response) {
          this.deleteEmployee(response.hasFutureTimesheets, response.length);
        } else {
          this._matSnackBar.open('Error checking future timesheets. Contact your admin.', 'OK', {
            verticalPosition: 'top',
            duration: 3000,
          });
        }
      })
      .catch((error) => {
        this.error = error;
      })
      .finally(() => {
        this._fuseProgressBarService.hide();
      });
  }

  deleteEmployee(hasTimesheets: boolean, quantity: number) {
    this.confirmDialogRef = this._matDialog.open(FuseConfirmDialogComponent, {
      disableClose: false,
    });

    let warnMessage = '';
    if (!!hasTimesheets) {
      warnMessage = `${quantity} ${this.translate.instant('COMMON.UNRESOLVED_SCHEDULES')}. `;
    }
    warnMessage += this.translate.instant('COMMON.DELETE_MSG');

    this.confirmDialogRef.componentInstance.confirmMessage = warnMessage;
    this.confirmDialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.error = null;
        this._fuseProgressBarService.show();
        this._figmaService
          .deleteEmployee(this.employee.user._id)
          .then((response) => {
            this.isEditMode = false;
            this.employeeForm.reset();
            this._figmaService.setSelected(null);
            this.deselect.emit();
            this._matSnackBar.open(
              `${this.translate.instant('COMMON.SCHEDULE_DELETED_SUCCESSFULLY')}`,
              'OK',
              {
                verticalPosition: 'top',
                duration: 2000,
              }
            );
          })
          .catch((error) => {
            this.error = error;
          })
          .finally(() => {
            this._fuseProgressBarService.hide();
          });
      }
      this.confirmDialogRef = null;
    });
  }

  onClickToggleAddView(event: any) {
    this.times[event.index].isSelectorOpen = !this.times[event.index].isSelectorOpen;
  }

  onChangeMatricule(event: any) {
    const { matricule } = this.employeeForm.value;
    if (!matricule || matricule === '' || isNaN(matricule) || parseInt(matricule) == 0) {
      this.toggleMatriculeError(true, true);
      return;
    }

    this.toggleMatriculeError(!!this.matricules.includes(matricule.toString()), false);
  }

  private toggleMatriculeError(error: boolean, isEmpty: boolean) {
    this.errorMatricule = isEmpty ? 'Matricule est requis' : 'Matricule indisponible';
    this.employeeForm.controls['matricule'].setErrors(error ? { incorrect: true } : null);
    this.employeeForm.controls['matricule'].markAsTouched();
  }

  private createTimeFormControls(timesRaw: any): void {
    if (!timesRaw) {
      return;
    }

    const times = [];
    for (let i = 0; i < timesRaw.length; i++) {
      const key1 = timesRaw[i].key;
      const value1 = timesRaw[i].value;
      times[key1] = value1;
    }

    const locationIds = Object.keys(times);
    const timeValues = Object.values(times);

    for (const field in this.horizontalStepperStep2.controls) {
      this.horizontalStepperStep2.removeControl(field);
    }

    for (var i = 0; i < locationIds.length; i++) {
      this.horizontalStepperStep2.addControl(
        locationIds[i],
        this._formBuilder.array([this._formBuilder.array([])])
      );
    }
    for (var h = 0; h < locationIds.length; h++) {
      const locationControlMain = this.horizontalStepperStep2.get(locationIds[h]) as FormArray; // 'control' is a FormControl
      const locationControls = locationControlMain.controls;
      const primaryFormArray = locationControls[0] as FormArray;

      for (var i = 0; i < timeValues[h][0].length; i++) {
        const time = timeValues[h][0][i];
        primaryFormArray.push(
          this._formBuilder.group({
            ['timeStart']: time.timeStart ? time.timeStart : '',
            ['timeEnd']: time.timeEnd ? time.timeEnd : '',
            ['timeStartSub']: time.timeStartSub ? time.timeStartSub : '',
            ['timeEndSub']: time.timeEndSub ? time.timeEndSub : '',
          })
        );
      }
    }
  }

  private updateTimeFormControls(items: SingleSelectionItem[]) {
    const rawEmployeeSchedules = this.horizontalStepperStep2.getRawValue();
    const locationIds = Object.keys(rawEmployeeSchedules);

    // remove controls that are no longer selected
    for (const field in this.horizontalStepperStep2.controls) {
      const isSelected = items.find((item) => {
        return item.id === field;
      });
      if (!isSelected) {
        this.horizontalStepperStep2.removeControl(field);
      }
    }

    // add controls that are not yet in the formgroup
    for (var i = 0; i < items.length; i++) {
      const selectedItem = items[i].id;
      if (!locationIds.includes(selectedItem)) {
        this.horizontalStepperStep2.addControl(
          selectedItem,
          this._formBuilder.array([this._formBuilder.array([])])
        );
        // add empty times for newly selected location
        const locationControlMain = this.horizontalStepperStep2.get(selectedItem) as FormArray; // 'control' is a FormControl
        const locationControls = locationControlMain.controls;
        const primaryFormArray = locationControls[0] as FormArray;
        for (var x = 0; x < this.days.length; x++) {
          primaryFormArray.push(
            this._formBuilder.group({
              ['timeStart']: '',
              ['timeEnd']: '',
              ['timeStartSub']: '',
              ['timeEndSub']: '',
            })
          );
        }
      }
    }
    this.initializeSingleLocationSelections();
  }

  get locationFormArray(): FormArray {
    if (!this.singleLocationSelected) {
      return this._formBuilder.array([]);
    }

    return this.horizontalStepperStep2.get(this.singleLocationSelected) as FormArray;
  }

  compareFn(c1: any, c2: any): boolean {
    return c1 && c2 ? c1 === c2 : false;
  }

  validateDate(hireDate: any, permDate: any): any {
    const hireDateMoment = moment(hireDate).startOf('day');
    const permDateMoment = moment(permDate).startOf('day');

    if (
      !hireDate ||
      (hireDate !== '' && !moment(hireDateMoment, moment.ISO_8601, true).isValid())
    ) {
      return { isValid: false, error: 'Hire date invalid.' };
    }

    if (!!permDate && !moment(permDateMoment, moment.ISO_8601, true).isValid()) {
      return { isValid: false, error: 'Permanent date invalid.' };
    }

    if (hireDateMoment.diff(permDateMoment, 'days') === 0) {
      return { isValid: false, error: 'Hire date should not be equal permanent date.' };
    }

    return { isValid: true };
  }
}
