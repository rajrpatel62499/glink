import * as _ from 'lodash';
import { Location } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewEncapsulation, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { FuseConfirmDialogComponent } from '@fuse/components/confirm-dialog/confirm-dialog.component';
import { FuseProgressBarService } from '@fuse/components/progress-bar/progress-bar.service';
import { FuseUtils } from '@fuse/utils';
import { User } from 'app/main/apps/user/user.model';
import { Subject } from 'rxjs';
import { CreateSupervisorService } from './create-supervisor.service';
import { Guid } from 'guid-typescript';

@Component({
  selector: 'create-supervisor',
  templateUrl: './create-supervisor.component.html',
  styleUrls: ['./create-supervisor.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations,
})
export class CreateSupervisorComponent implements OnInit, OnDestroy {
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

  private _unsubscribeAll: Subject<any>;

  /**
   * Constructor
   *
   * @param {EcommerceProductService} _ecommerceProductService
   * @param {FormBuilder} _formBuilder
   * @param {Location} _location
   * @param {MatSnackBar} _matSnackBar
   * 
   */
  constructor(
    private _createSupervisorService: CreateSupervisorService,
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

  focusTitleField(): void {
    setTimeout(() => {});
  }

  createSteppers() {
    var locString = '';
    if (!!this.user && !!this.user.locations && this.user.locations.length > 0) {
      this.user.locations.forEach((locItem) => {
        locString += `${locItem.name}, `;
      });
      locString = locString.substring(0, locString.length - 2);
    }

    this.horizontalStepperStep1 = this._formBuilder.group({
      id: [this.user._id],
      type: [
        { value: this.user.type, disabled: false },
        [Validators.required, Validators.minLength(3)],
      ],
      username: [
        {
          value: Guid.raw(), //this.user.username,
          disabled: true,
        },
        [Validators.required, Validators.minLength(3)],
      ],
      password: [
        {
          value: 'abc123', //this.user.password,
          disabled: true,
        },
        [Validators.required, Validators.minLength(3)],
      ],
      first: [
        { value: this.user.first, disabled: false },
        [Validators.required, Validators.minLength(3)],
      ],
      last: [
        { value: this.user.last, disabled: false },
        [Validators.required, Validators.minLength(3)],
      ],
      deviceSerialNumber: [
        {
          value: !!this.user.deviceSerialNumber ? this.user.deviceSerialNumber : '',
          disabled: false,
        },
        [],
      ],
      location: [
        {
          value: this.user.locations ? locString : '',
          disabled: true,
        },
        [Validators.required, Validators.minLength(3)],
      ],
      updatedAt: [this.user.updatedAt],
      modifiedAt: [this.user.modifiedAt],
      devices: [this.user.devices],
    });
  }

  addUser(): void {
    this.error = null;
    this._fuseProgressBarService.show();

    this._createSupervisorService
      .addUser(this.horizontalStepperStep1.getRawValue())
      .then((response) => {
        this.reset();

        // this._matSnackBar.open('Supervisor added', 'OK', {
        //   verticalPosition: 'top',
        //   duration: 2000,
        // });
        this.success = true;
      })
      .catch((error) => {
        this.error = error;
      })
      .finally(() => {
        this._fuseProgressBarService.hide();
      });
  }

  reset() {
    this.error = null;
    this.success = false;
    this.user = new User({ type: 'SUPERVISOR' });
    this.user._id = FuseUtils.generateGUID();
    this.formType = 'new';
    this.createSteppers();
    this.focusTitleField();
  }
}
