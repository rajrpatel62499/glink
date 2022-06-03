import { Location } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { FuseConfirmDialogComponent } from '@fuse/components/confirm-dialog/confirm-dialog.component';
import { FuseProgressBarService } from '@fuse/components/progress-bar/progress-bar.service';
import { FuseUtils } from '@fuse/utils';
import { Employee } from 'app/main/apps/employee/models/employee.model';
import { MultiSelectionItem } from 'app/main/ui/custom/multiple-selection/multiple-selection.component';
import { Subject } from 'rxjs';
import { CreateEmployeeService } from './create-employee.service';
import * as _ from 'lodash';
import { RecommendedTime } from 'app/main/apps/employee/models/recommended-time.model';
import { takeUntil } from 'rxjs/operators';
import { parseInt } from 'lodash';
import { SingleSelectionItem } from 'app/main/apps/employee/sidenavs/right/detail/detail.component';
import { Guid } from 'guid-typescript';
import * as moment from 'moment';

@Component({
  selector: 'create-employee',
  templateUrl: './create-employee.component.html',
  styleUrls: ['./create-employee.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations,
})
export class CreateEmployeeComponent implements OnInit, OnDestroy {
  pageType: string = 'new';
  employee: Employee;
  formType: string;
  offs = ['SAT', 'SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI'];
  times: RecommendedTime[] = [];
  timeStarts = ['', '', '', '', '', '', ''];
  timeEnds = ['', '', '', '', '', '', ''];
  timeStartSub = ['', '', '', '', '', '', ''];
  timeEndSub = ['', '', '', '', '', '', ''];
  classes = ['A', 'B', 'NA'];
  regions = ['MONTREAL', 'QUEBEC', 'ONTARIO'];
  types = ['COMMON.EMPLOYE', 'COMMON.CONTRACTOR', 'COMMON.UNKNOWN'];
  selectedType = '';
  // locationSelections: MultiSelectionItem[] = [];
  // locationsSelected: string[] = [];
  error: any;
  success: boolean = false;
  dialogRef: any;
  confirmDialogRef: MatDialogRef<FuseConfirmDialogComponent>;
  horizontalStepperStep1: FormGroup;
  horizontalStepperStep2: FormGroup;
  errorMatricule: string = 'Matricule est requis';
  matricules: string[] = [];
  lastMatricule: string = '0001';
  employeeType: String = '';
  isMobileAppEnabled: boolean;

  singleLocationSelections: SingleSelectionItem[] = [];
  singleLocationSelected: string = '';
  singleLocationControl: FormControl = new FormControl('');

  private _unsubscribeAll: Subject<any>;

  i = 0;
  test = '';
  days = [
    'COMMON.SUNDAY',
    'COMMON.MONDAY',
    'COMMON.TUESDAY',
    'COMMON.WEDNESDAY',
    'COMMON.THURSDAY',
    'COMMON.FRIDAY',
    'COMMON.SATURDAY',
  ];

  locationsFormControl = new FormControl();
  locationSelections: MultiSelectionItem[] = [];
  locationsSelected: string[] = [];
  locationsSelectedName: string[] = [];
  // toppingList: any[] = [{id: '1', name: 'one'}, {id: '2', name: 'two'}, {id: '3', name: 'three'}];

  constructor(
    private _employeeService: CreateEmployeeService,
    private _formBuilder: FormBuilder,
    private _fuseProgressBarService: FuseProgressBarService,
    public _matDialog: MatDialog,
    public _router: Router,
    public _location: Location
  ) {
    this._unsubscribeAll = new Subject();
  }

  ngOnInit(): void {
    for (var i = 0; i < 7; i++) {
      this.times[i] = {
        isSelectorOpen: false,
      };
    }

    this.reset();
    this.focusTitleField();
    this.loadPrerequisites();

    this._employeeService.onAllEmployeesChanged
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((employees: Employee[]) => {
        this.matricules = employees.map((item) => {
          return item.matricule;
        });

        this.horizontalStepperStep1.patchValue({
          matricule: this.getNextMatricule(this.matricules, this.lastMatricule),
          type: 'COMMON.EMPLOYE',
          class: 'A',
        });

        this.horizontalStepperStep1.controls['type'].valueChanges.subscribe((value) => {
          if (!value) {
            this.classes = ['A', 'B', 'NA'];
            return;
          }
          this.selectedType = value;
          this.classes = value === 'COMMON.EMPLOYE' ? ['A', 'B', 'A+B'] : ['NA'];
          this.horizontalStepperStep1.patchValue({
            class: value === 'COMMON.EMPLOYE' ? '' : 'NA',
            tenurePermanent: null,
          });
        });
      });

    this._employeeService.onAllLocationsChanged
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((locations) => {
        this.locationSelections = locations.map((item) => {
          return { id: item._id, name: item.name, selected: false };
        });

        this.locationSelections = _.orderBy(this.locationSelections, ['name'], ['asc']);
        this.singleLocationSelections = this.locationSelections;
      });
  }

  get locationFormArray(): FormArray {
    if (!this.singleLocationSelected) {
      return this._formBuilder.array([]);
    }

    const control = this.horizontalStepperStep2.get(this.singleLocationSelected) as FormArray;
    return control ? control : null;
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
        for (var i = 0; i < this.days.length; i++) {
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

  private initializeSingleLocationSelections() {
    if (this.singleLocationSelected !== '') {
      this.singleLocationControl.patchValue(this.singleLocationSelected);
    } else {
      this.singleLocationControl.patchValue('');
    }
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }

  loadPrerequisites() {
    this._employeeService.getAllEmployees();
    this._employeeService.getAllLocations();
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

    this.horizontalStepperStep1.patchValue({
      location: this.locationsSelected,
    });

    // set the time locations based on the initially selected locations
    this.singleLocationSelections = this.locationSelections.filter((item) => {
      return this.locationsSelected.includes(item.id);
    });
    this.singleLocationSelections.forEach((item) => {
      item.selected = true;
      return item;
    });

    this.singleLocationSelected =
      this.singleLocationSelections.length > 0 ? this.singleLocationSelections[0].id : '';
    this.updateTimeFormControls(this.singleLocationSelections);
  }

  onLocationSelectedForTimeChange(item: any): void {
    if (!!item && !!item.value) {
      this.singleLocationSelected = item.value;
      return;
    }
    this.singleLocationSelected = '';
  }

  focusTitleField(): void {}

  createSteppers() {
    this.horizontalStepperStep1 = this._formBuilder.group({
      matricule: [
        {
          value: this.employee.matricule,
          disabled: false,
        },
        [Validators.required, Validators.minLength(3)],
      ],
      location: [
        {
          value: this.employee.location ? this.employee.location._id : '',
          disabled: false,
        },
        [Validators.required, Validators.minLength(1)],
      ],
      first: [
        {
          value: '',
          disabled: false,
        },
        [Validators.required, Validators.minLength(3)],
      ],
      last: [
        {
          value: '',
          disabled: false,
        },
        [Validators.required, Validators.minLength(3)],
      ],
      email: [
        {
          value: '',
          disabled: false,
        },
        [],
      ],
      type: [
        {
          value: this.employee.type ? this.employee.type : 'A',
          disabled: false,
        },
        [Validators.required, Validators.minLength(1)],
      ],
      class: [
        {
          value: 'A',
          disabled: false,
        },
        [Validators.required, Validators.minLength(1)],
      ],
      hireDateStart: [
        {
          value: this.employee.hireDateStart ? this.employee.hireDateStart : new Date(),
          disabled: false,
        },
        [Validators.required, Validators.minLength(3)],
      ],
      tenurePermanent: [
        {
          value: this.employee.tenurePermanent ? this.employee.tenurePermanent : null,
          disabled: false,
        },
        [],
      ],
      region: [
        {
          value: 'MONTREAL',
          disabled: false,
        },
        [Validators.required, Validators.minLength(1)],
      ],
      hireDateEnd: [
        {
          value: this.employee.hireDateEnd,
          disabled: false,
        },
        [],
      ],
      isMobileAppEnabled: [
        {
          value: this.employee.isMobileAppEnabled ? this.employee.isMobileAppEnabled : false,
          disabled: false,
        },
        [],
      ],
      // dummy follows pending login flow
      username: [
        {
          value: '', // will use matricule as default username,
          disabled: true,
        },
        [Validators.required, Validators.minLength(3)],
      ],
      password: [
        {
          value: Guid.create().toString().slice(0, 8),
          disabled: true,
        },
        [Validators.required, Validators.minLength(3)],
      ],
    });

    this.horizontalStepperStep2 = this._formBuilder.group({ temp: this._formBuilder.control('') });
  }

  addEmployee(): void {
    const rawEmployeeBasic = this.horizontalStepperStep1.getRawValue();
    const rawEmployeeSchedule = this.horizontalStepperStep2.getRawValue();
    this.lastMatricule = rawEmployeeBasic.matricule;

    const times = [];
    for (const [key, value] of Object.entries(rawEmployeeSchedule)) {
      times.push({
        key,
        value,
      });
    }

    const { isValid, error } = this.validateDate(
      rawEmployeeBasic.hireDateStart,
      rawEmployeeBasic.tenurePermanent
    );

    if (!isValid) {
      this.error = error;
      return;
    }

    const e_class = rawEmployeeBasic.class == 'A+B' ? 'AB' : rawEmployeeBasic.class; 

    const payload = {
      first: rawEmployeeBasic.first,
      hireDateEnd: rawEmployeeBasic.hireDateEnd,
      hireDateStart: rawEmployeeBasic.hireDateStart,
      last: rawEmployeeBasic.last,
      locations: this.locationsSelected,
      class: e_class,
      region: rawEmployeeBasic.region.toUpperCase(),
      isMobileAppEnabled: rawEmployeeBasic.isMobileAppEnabled,
      matricule: rawEmployeeBasic.matricule.toString(),
      employeeType: this.getRawEmployeeType(rawEmployeeBasic.type),
      tenurePermanent: rawEmployeeBasic.tenurePermanent,
      type: 'EMPLOYEE',
      times,
      // additional user properties
      username: rawEmployeeBasic.matricule.toString(),
      password: rawEmployeeBasic.password,
      email: rawEmployeeBasic.email,
      devices: [],
      address: '',
      supervisor: null,
      banner: null,
    };

    this.error = null;
    this._fuseProgressBarService.show();
    this._employeeService
      .addEmployee(payload)
      .then((response) => {
        this.success = true;
      })
      .catch((error) => {
        this.error = error;
      })
      .finally(() => {
        this._fuseProgressBarService.hide();
      });
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

  getRawEmployeeType(translatableType: String) {
    if (translatableType === 'COMMON.EMPLOYE') {
      return 'EMPLOYEE';
    } else if (translatableType === 'COMMON.CONTRACTOR') {
      return 'CONTRACTOR';
    } else {
      return 'UNKNOWN';
    }
  }

  onClickToggleAddView(event: any) {
    this.times[event.index].isSelectorOpen = !this.times[event.index].isSelectorOpen;
  }

  onClickPrevious() {
    this.error = null;
    this.success = false;
  }

  onChangeMatricule(event: any) {
    const { matricule } = this.horizontalStepperStep1.value;
    if (!matricule || matricule === '' || isNaN(matricule) || parseInt(matricule) == 0) {
      this.toggleMatriculeError(true, true);
      return;
    }

    this.toggleMatriculeError(!!this.matricules.includes(matricule.toString()), false);
  }

  toggleMatriculeError(error: boolean, isEmpty: boolean) {
    this.errorMatricule = isEmpty
      ? 'EMPLOYEE.REGISTRATION_NUMBER_ERR'
      : 'EMPLOYEE.REGISTRATION_NUMBER_ERR';
    this.horizontalStepperStep1.controls['matricule'].setErrors(error ? { incorrect: true } : null);
    this.horizontalStepperStep1.controls['matricule'].markAsTouched();
  }

  reset() {
    this.error = null;
    this.success = false;
    this.employee = new Employee({});
    this.employee._id = FuseUtils.generateGUID();
    this.formType = 'new';
    this.singleLocationSelected = '';
    this.locationsSelected = [];
    this.locationsSelectedName = [];
    this.locationsFormControl.reset();
    this.createSteppers();
    this.loadPrerequisites();

    // remove controls that are no longer selected
    for (const field in this.horizontalStepperStep2.controls) {
      this.horizontalStepperStep2.removeControl(field);
    }
  }

  checkInvalidControls() {
    for (let el in this.horizontalStepperStep1.controls) {
      if (this.horizontalStepperStep1.controls[el].errors) {
        
      }
    }
  }

  private getNextMatricule(array, current) {
    let regexIndex = current.search(/[1-9]/g);
    const defaultMatricule = '0001';

    if (isNaN(current)) {
      current = defaultMatricule;
      regexIndex = current.search(/[1-9]/g);
    } else if (regexIndex == -1) {
      current = defaultMatricule;
      regexIndex = current.search(/[1-9]/g);
    }

    const postfix = current.substring(regexIndex);

    if (isNaN(postfix)) {
      return;
    }

    const zeros = current.substring(0, regexIndex);
    let postfixNumber = parseInt(postfix);
    if (array.includes(current.toString())) {
      while (array.includes(current.toString())) {
        postfixNumber += 1;
        const zerosNet = zeros.substring(postfixNumber.toString().length - postfix.length);
        current = `${zerosNet}${postfixNumber}`;
      }
    }
    return current;
  }
}
