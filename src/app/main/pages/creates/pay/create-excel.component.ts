import { Location } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { FuseConfirmDialogComponent } from '@fuse/components/confirm-dialog/confirm-dialog.component';
import { FuseProgressBarService } from '@fuse/components/progress-bar/progress-bar.service';
import { MatColors } from '@fuse/mat-colors';
import { FuseUtils } from '@fuse/utils';
import { CalendarEvent } from 'angular-calendar';
import { User } from 'app/main/apps/user/user.model';
import * as moment from 'moment';
import { Subject } from 'rxjs';
import { CreateExcelService } from './create-excel.service';

@Component({
  selector: 'create-excel',
  templateUrl: './create-excel.component.html',
  styleUrls: ['./create-excel.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations,
})
export class CreateExcelComponent implements OnInit, OnDestroy {
  pageType: string = 'new';

  user: User;
  tags: any[];
  formType: string;
  isEditMode: boolean;
  isEditedPassword: boolean = false;

  dialogRef: any;
  confirmDialogRef: MatDialogRef<FuseConfirmDialogComponent>;

  horizontalStepperStep1: FormGroup;
  horizontalStepperStep2: FormGroup;
  error: any;
  success: boolean = false;

  action: string;
  event: CalendarEvent;
  eventForm: FormGroup;
  dialogTitle: string;
  presetColors = MatColors.presets;
  myFilter = (d: Date | null): boolean => {
    const day = (d || new Date()).getDay();
    return day === 6;
  };
  minDate = new Date('2021/01/01');
  maxDate = new Date();

  selected: any;
  selectedStart: any;
  selectedEnd: any;
  selectedEndPayload: any; // bug fix for firefox
  errorCalendar: any;
  supervisors: User[];

  downloadUrl: string;

  // payslip end

  private _unsubscribeAll: Subject<any>;

  /**
   * Constructor
   *
   * @param {EcommerceProductService} _ecommerceProductService
   * @param {FormBuilder} _formBuilder
   * @param {Location} _location
   * @param {MatSnackBar} _matSnackBar
   */
  constructor(
    private _createExcelService: CreateExcelService,
    private _formBuilder: FormBuilder,
    private _fuseProgressBarService: FuseProgressBarService,
    public _matDialog: MatDialog,
    public _router: Router,
    public _location: Location,
    private _matSnackBar: MatSnackBar
  ) {
    this._unsubscribeAll = new Subject();
  }

  ngOnInit(): void {
    this.reset();
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }

  onCalendarChange(date) {
    this.selected = date;
    this.errorCalendar = null;
    this.selectedEnd = moment(date).format('DD-MMMM-YYYY');
    this.selectedEndPayload = date;
    this.selectedStart = moment(date).subtract(14, 'days').format('DD-MMMM-YYYY');
    this.horizontalStepperStep1.get('calendar').setValue(date);
  }

  onClickNext() {
    if (!this.horizontalStepperStep1.valid) {
      this.errorCalendar = {};
    }
  }

  loadPrerequisites() {
    this._fuseProgressBarService.show();
    this._createExcelService
      .getAllUsers()
      .then((response) => {
        const responseUsers = response.users.map((item) => {
          return new User(item);
        });

        const supervisors = responseUsers.filter((user) => {
          return user.type == 'SUPERVISOR';
        });
        this.supervisors = supervisors;
      })
      .catch((error) => {
        this.error = error;
      })
      .finally(() => {
        this._fuseProgressBarService.hide();
      });
  }

  focusTitleField(): void {
    setTimeout(() => {});
  }

  createSteppers() {
    this.horizontalStepperStep1 = this._formBuilder.group({
      calendar: [
        {
          value: null,
          disabled: false,
        },
        [Validators.required, Validators.minLength(3)],
      ],
    });
  }

  downloadCurrentSchedule(): void {
    const dateRangeEnd = this.selectedEndPayload ? this.selectedEndPayload : new Date();
    this._fuseProgressBarService.show();
    this._createExcelService
      .generateSpreadsheet({ dateRangeEnd })
      .then((response) => {
        if (!response || response === '') {
          this.error = { error: 'Something went wrong. ' };
          return;
        }
        window.open(response, '_blank');
        this.success = true;
        this.downloadUrl = response;
      })
      .catch((error) => {
        this.error = { error: 'Something went wrong. ' + error };
      })
      .finally(() => {
        this._fuseProgressBarService.hide();
      });
  }

  reset() {
    this.error = null;
    this.selectedStart = null;
    this.selectedEnd = null;
    this.selectedEndPayload = null;
    this.selected = null;
    this.success = false;
    this.downloadUrl = null;
    this.errorCalendar = null;
    this.user = new User({ type: 'SUPERVISOR' });
    this.user._id = FuseUtils.generateGUID();
    this.formType = 'new';
    this.createSteppers();
    this.focusTitleField();
  }
}
