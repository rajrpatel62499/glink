import { Location } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
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
import { map, startWith, takeUntil } from 'rxjs/operators';
import { CreatePropertyService } from './create-property.service';
import { Guid } from 'guid-typescript';
import * as _ from 'lodash';
import { GooglePlaceDirective } from 'ngx-google-places-autocomplete';
import { Address } from 'ngx-google-places-autocomplete/objects/address';

@Component({
  selector: 'create-property',
  templateUrl: './create-property.component.html',
  styleUrls: ['./create-property.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations,
})
export class CreatePropertyComponent implements OnInit, OnDestroy {
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
  bannerOptions: string[] = [];
  bannerFilteredOptions: Observable<string[]>;
  bannerControl = new FormControl();
  divisionOptions: string[] = [];
  divisionFilteredOptions: Observable<string[]>;
  divisionControl = new FormControl();

  horizontalStepperStep1: FormGroup;
  horizontalStepperStep2: FormGroup;
  error: any;
  success: boolean = false;
  geolocation: AnkaGeoLocation;
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
    private _createPropertyService: CreatePropertyService,
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
    this.loadPrerequisites();

    this._createPropertyService.onAllUsersChanged
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((users) => {
        this.bannerOptions = users
          .map((item) => item.banner)
          .filter((value, index, self) => {
            return !!value && value !== '' && self.indexOf(value) === index;
          });

        this.bannerFilteredOptions = this.bannerControl.valueChanges.pipe(
          startWith(''),
          map((value) => {
            return this._filterBanner(value);
          })
        );
        this.bannerControl.setValue(this.bannerOptions.length > 0 ? this.bannerOptions[0] : '');

        this.supervisors = users.filter((user) => {
          return user.type == 'SUPERVISOR';
        });

        this.bannerOptions = this.bannerOptions.sort(function (a, b) {
          return a.toLowerCase().localeCompare(b.toLowerCase());
        });

        this.supervisors = _.orderBy(this.supervisors, ['first'], ['asc']);
      });

    this._createPropertyService.onAllLocationsChanged
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((locations) => {
        this.divisionOptions = locations
          .map((item) => item.division)
          .filter((value, index, self) => {
            return !!value && value !== '' && self.indexOf(value) === index;
          });

        this.divisionFilteredOptions = this.divisionControl.valueChanges.pipe(
          startWith(''),
          map((value) => {
            return this._filterDivision(value);
          })
        );

        this.divisionOptions = this.divisionOptions.sort(function (a, b) {
          return a.toLowerCase().localeCompare(b.toLowerCase());
        });

        this.divisionControl.setValue(
          this.divisionOptions.length > 0 ? this.divisionOptions[0] : ''
        );
      });
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }

  public handleAddressChange(address: Address) {
    this.geolocation = {
      coordinates: [address.geometry.location.lng(), address.geometry.location.lat()],
      name: address.formatted_address.includes(address.name) ? address.formatted_address :`${address.name}, ${address.formatted_address}`,
    };
    this.horizontalStepperStep1.patchValue({
      geolocationName: this.geolocation.name,
      geolocationCoordinates: this.geolocation.coordinates,
    });
  }

  private _filterBanner(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.bannerOptions.filter((option) => {
      return option.toLowerCase().includes(filterValue);
    });
  }

  private _filterDivision(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.divisionOptions.filter((option) => {
      return option.toLowerCase().includes(filterValue);
    });
  }

  loadPrerequisites() {
    this._createPropertyService.getAllUsers();
    this._createPropertyService.getAllLocations();
  }

  focusTitleField(): void {
    setTimeout(() => {});
  }

  createSteppers() {
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
      deviceSerialNumber: [
        {
          value: !!this.user.deviceSerialNumber ? this.user.deviceSerialNumber : '',
          disabled: false,
        },
        [],
      ],
      // LOCATION
      name: [
        {
          value: '',
          disabled: false,
        },
        [Validators.required, Validators.minLength(3)],
      ],
      clientCode: [
        {
          value: '',
          disabled: false,
        },
        [Validators.required, Validators.minLength(1)],
      ],
      address: [
        {
          value: '',
          disabled: false,
        },
        [Validators.required],
      ],
      geolocationName: [
        {
          value: '',
          disabled: false,
        },
        [Validators.required],
      ],
      geolocationCoordinates: [
        {
          value: [],
          disabled: false,
        },
        [Validators.required],
      ],
      supervisor: [
        {
          value: '',
          disabled: false,
        },
        [Validators.required, Validators.minLength(3)],
      ],
    });
  }

  onNext(): void {
    const userForm = this.horizontalStepperStep1.getRawValue();

    if (
      userForm.geolocationName === '' ||
      !userForm.geolocationCoordinates ||
      userForm.geolocationCoordinates.length === 0
    ) {
      this.horizontalStepperStep1.patchValue({
        address: '',
      });
    }
  }


  addUser(): void {
    this._fuseProgressBarService.show();
    const userForm = this.horizontalStepperStep1.getRawValue();
    this.error = null;

    const payloadUserAndLocation = {
      username: userForm.username,
      password: userForm.password,
      deviceSerialNumber: userForm.deviceSerialNumber,
      first: '',
      last: '',
      type: 'PROPERTY',
      devices: null,
      name: userForm.name,
      supervisor: userForm.supervisor,
      banner: this.bannerControl.value,
      division: this.divisionControl.value,
      address: userForm.geolocationName,
      coordinates: userForm.geolocationCoordinates,
      clientCode: userForm.clientCode
    };

    this._createPropertyService
      .addUserAndLocation(payloadUserAndLocation)
      .then((userResponse) => {
        this.reset();
        this.loadPrerequisites();
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
    this.success = false;
    this.error = null;

    this.location = new ALocation({ employees: [] });
    this.location._id = FuseUtils.generateGUID();
    this.geolocation = null;
    this.user = new User({ type: 'PROPERTY' });
    this.user._id = FuseUtils.generateGUID();
    this.formType = 'new';
    this.createSteppers();
    this.focusTitleField();
  }

  filterCoursesByCategory(): void {}

  filterCoursesByTerm(): void {}
}
