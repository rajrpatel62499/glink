import { Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';

import { ALocation } from 'app/main/apps/location/location.model';
import { FuseConfirmDialogComponent } from '@fuse/components/confirm-dialog/confirm-dialog.component';
import { FuseProgressBarService } from '@fuse/components/progress-bar/progress-bar.service';
import { FuseUtils } from '@fuse/utils';
import { Location } from '@angular/common';
import { LocationService } from 'app/main/apps/location/location.service';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { User } from '../../user/user.model';
import { fuseAnimations } from '@fuse/animations';

@Component({
  selector: 'location-details',
  templateUrl: './location-details.component.html',
  styleUrls: ['./location-details.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations,
})
export class LocationDetailsComponent implements OnInit, OnDestroy {
  location: ALocation;
  tags: any[];
  formType: string;
  locationForm: FormGroup;
  isEditMode: boolean;
  error: any;

  supervisors: User[];
  properties: User[];

  dialogRef: any;
  confirmDialogRef: MatDialogRef<FuseConfirmDialogComponent>;

  private _unsubscribeAll: Subject<any>;

  /**
   * Constructor
   *
   * @param {LocationService} _locationService
   * @param {FormBuilder} _formBuilder
   */
  constructor(
    private _locationService: LocationService,
    private _formBuilder: FormBuilder,
    private _fuseProgressBarService: FuseProgressBarService,
    public _matDialog: MatDialog,
    public _router: Router,
    public _location: Location
  ) {
    this._unsubscribeAll = new Subject();
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------

  /**
   * On init
   */
  ngOnInit(): void {
    // Subscribe to update the current location
    this._locationService.onCurrentLocationChanged
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(([currentLocation, formType]) => {
        if (currentLocation && formType === 'edit') {
          this.formType = 'edit';
          this.location = currentLocation;
          this.loadPrerequisites();
          this.locationForm = this.createLocationForm();
        }

        if (!currentLocation) {
          this.reset();
        }
      });

    // Subscribe to update on tag change
    this._locationService.onAllTagsChanged
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((labels) => {
        this.tags = labels;
      });

    // Subscribe to update on tag change
    this._locationService.onNewLocationClicked
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(() => {
        this.location = new ALocation({});
        this.location._id = FuseUtils.generateGUID();
        this.formType = 'new';
        this.locationForm = this.createLocationForm();
        this.focusTitleField();
        this.loadPrerequisites();
        this._locationService.onCurrentLocationChanged.next([this.location, 'new']);
      });
  }

  loadPrerequisites() {
    this._fuseProgressBarService.show();
    this._locationService
      .getAllUsers()
      .then((response) => {
        const responseUsers = response.users.map((item) => {
          return new User(item);
        });

        const supervisors = responseUsers.filter((user) => {
          return user.type == 'SUPERVISOR';
        });
        this.supervisors = supervisors;

        const properties = responseUsers.filter((user) => {
          return user.type == 'PROPERTY';
        });
        this.properties = properties;
      })
      .catch((error) => {
        this.error = error;
      })
      .finally(() => {
        this._fuseProgressBarService.hide();
      });
  }

  /**
   * On destroy
   */
  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  /**
   * Focus title field
   */
  focusTitleField(): void {
    setTimeout(() => {});
  }

  /**
   * Create location form
   *
   * @returns {FormGroup}
   */
  createLocationForm(): FormGroup {
    return this._formBuilder.group({
      id: [this.location._id],
      name: [
        {
          value: this.location.name,
          disabled: false,
        },
        [Validators.required, Validators.minLength(3)],
      ],
      address: [
        {
          value: this.location.address,
          disabled: false,
        },
        [Validators.required, Validators.minLength(3)],
      ],
      startTime: [
        {
          value: this.location.startTime ? this.location.startTime : '09:00',
          disabled: false,
        },
        [Validators.required, Validators.minLength(3)],
      ],
      endTime: [
        {
          value: this.location.endTime ? this.location.endTime : '17:00',
          disabled: false,
        },
        [Validators.required, Validators.minLength(3)],
      ],
      supervisor: [
        {
          value: this.location.supervisor ? this.location.supervisor._id : '',
          disabled: false,
        },
        [Validators.required, Validators.minLength(3)],
      ],
      property: [
        {
          value: this.location.property ? this.location.property._id : '',
          disabled: false,
        },
        [Validators.required, Validators.minLength(3)],
      ],
      employees: [
        {
          value: this.location.employees ? this.location.employees : '',
          disabled: true,
        },
      ],
    });
  }

  /**
   * Add location
   */
  addLocation(): void {
    this.error = null;
    this._fuseProgressBarService.show();

    this._locationService
      .addLocation(this.locationForm.getRawValue())
      .then((response) => {
        this._locationService.onCurrentLocationChanged.next([null, null]);
        this._router.navigate(['/apps/location/temp']).then(() => {
          this._router.navigate(['/apps/location/all']);
          this._locationService.onCurrentLocationChanged.next([null, null]);
        });
      })
      .catch((error) => {
        this.error = error;
      })
      .finally(() => {
        this._fuseProgressBarService.hide();
      });
  }

  /**
   * Edit location
   */
  editLocation(): void {
    this.error = null;
    this._fuseProgressBarService.show();
    this._locationService
      .updateLocation(this.locationForm.getRawValue())
      .then((response) => {
        this._locationService.onCurrentLocationChanged.next([null, null]);
        this._router.navigate(['/apps/location/all']);
      })
      .catch((error) => {
        this.error = error;
      })
      .finally(() => {
        this._fuseProgressBarService.hide();
      });
  }

  /**
   * Delete Contact
   */
  deleteContact(location): void {
    this.confirmDialogRef = this._matDialog.open(FuseConfirmDialogComponent, {
      disableClose: false,
    });

    this.confirmDialogRef.componentInstance.confirmMessage = 'Are you sure you want to delete?';

    this.confirmDialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.error = null;
        this._fuseProgressBarService.show();
        this._locationService
          .deleteLocation(this.locationForm.getRawValue())
          .then((response) => {
            this._locationService.onCurrentLocationChanged.next([null, null]);
            this._router.navigate(['/apps/location/all']);
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

  reset() {
    this.location = null;
    this.tags = [];
    this.formType = '';
    this.locationForm = null;
    this.isEditMode = false;
    this.error = null;
  }
}
