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
import { FormBuilder, FormControl, FormGroup, NgForm, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { FuseConfirmDialogComponent } from '@fuse/components/confirm-dialog/confirm-dialog.component';
import { FuseProgressBarService } from '@fuse/components/progress-bar/progress-bar.service';
import { FusePerfectScrollbarDirective } from '@fuse/directives/fuse-perfect-scrollbar/fuse-perfect-scrollbar.directive';
import { AnkaGeoLocation } from 'app/main/apps/location/location.model';
import { GooglePlaceDirective } from 'ngx-google-places-autocomplete';
import { Address } from 'ngx-google-places-autocomplete/objects/address';
import { Observable, Subject } from 'rxjs';
import { map, startWith, takeUntil } from 'rxjs/operators';
import { UserService } from '../../../figma.service';
import { User } from '../../../user.model';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'figma-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class FigmaDetailComponent implements OnInit, OnDestroy, AfterViewInit {
  @Output() deselect: EventEmitter<any> = new EventEmitter();

  @ViewChild('placesRef')
  placesRef: GooglePlaceDirective;

  @ViewChild(FusePerfectScrollbarDirective)
  directiveScroll: FusePerfectScrollbarDirective;

  @ViewChildren('replyInput')
  replyInputField;

  @ViewChild('replyForm')
  replyForm: NgForm;

  mapOptions = {
    componentRestrictions: { country: 'CA' },
  };

  user: User = null;
  tags: any[];
  formType: string;
  userForm: FormGroup;
  isEditMode: boolean;
  error: any = null;
  isEditedPassword: boolean = false;

  dialogRef: any;
  confirmDialogRef: MatDialogRef<FuseConfirmDialogComponent>;

  supervisors: User[] = [];

  bannerOptions: string[] = [];
  filteredOptions: Observable<string[]>;
  bannerControl = new FormControl();

  private _unsubscribeAll: Subject<any>;
  figma: any;
  dialog: any;
  contact: any;
  replyInput: any;
  geolocation: AnkaGeoLocation;
  clients: any[];
  selectedClient: string;

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
    this._figmaService.onCurrentFigmaChanged
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((figmaData) => {
        if (!!figmaData) {
          
          this.user = figmaData;
          this.formType = 'edit';
          this.userForm = this.createUserForm();
          this.userForm.controls['password'].valueChanges.subscribe((value) => {
            this.isEditedPassword = true;
          });
          this.bannerControl.setValue(this.user.banner);

          this.clients = this.user.locations.map(x =>  { return {_id: x.property, name: x.name}} );
          this.selectedClient = this.clients.length > 0 ? this.clients[0]._id : '';
        }
      });

    this._figmaService.onFigmasListUnfilteredChanged
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((usersResponse) => {
        if (!!usersResponse) {
          this.bannerOptions = usersResponse
            .map((item) => item.banner)
            .filter((value, index, self) => {
              return value !== '' && self.indexOf(value) === index;
            });
          this.filteredOptions = this.bannerControl.valueChanges.pipe(
            startWith(''),
            map((value) => {
              return this._filter(value);
            })
          );
        }
      });

    this._figmaService.onSupervisorListChanged
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((users) => {
        if (!!users && users.length > 0) {
          this.supervisors = users;
        }
      });

    this.loadPrerequisites();
  }

  ngAfterViewInit(): void {}

  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }

  loadPrerequisites() {}

  handleAddressChange(address: Address) {
    this.geolocation = {
      coordinates: [address.geometry.location.lng(), address.geometry.location.lat()],
     name: address.formatted_address.includes(address.name) ? address.formatted_address :`${address.name}, ${address.formatted_address}`,
    };
    this.userForm.patchValue({
      geolocationName: this.geolocation.name,
      geolocationCoordinates: this.geolocation.coordinates,
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

  createUserForm(): FormGroup {
    var locString = '';
    if (!!this.user && !!this.user.locations && this.user.locations.length > 0) {
      this.user.locations.forEach((locItem) => {
        locString += `${locItem.name}, `;
      });
      locString = locString.substring(0, locString.length - 2);
    }

    

    return this._formBuilder.group({
      id: [this.user._id],
      type: [
        { value: this.user.type, disabled: false },
        [Validators.required, Validators.minLength(3)],
      ],
      username: [
        {
          value: this.user.username,
          disabled: false,
        },
        [Validators.required, Validators.minLength(3)],
      ],
      password: [
        { value: this.user.password, disabled: false },
        [Validators.required, Validators.minLength(3)],
      ],
      first: [
        { value: this.user.first, disabled: false },
        this.user.type === 'PROPERTY' ? [] : [Validators.required, Validators.minLength(3)],
      ],
      last: [
        { value: this.user.last, disabled: false },
        this.user.type === 'PROPERTY' ? [] : [Validators.required, Validators.minLength(3)],
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
      deviceSerialNumber: [
        {
          value: !!this.user.deviceSerialNumber ? this.user.deviceSerialNumber : '',
          disabled: false,
        },
        [],
      ],
      // location details follow
      name: [
        {
          value:
            !!this.user.locations[0] && !!this.user.locations[0].name
              ? this.user.locations[0].name
              : '',
          disabled: false,
        },
        this.user.type !== 'PROPERTY' ? [] : [Validators.required, Validators.minLength(3)],
      ],
      clientCode: [
        {
          value:   !!this.user.locations[0] && !!this.user.locations[0].clientCode
          ? this.user.locations[0].clientCode
          : '',
          disabled: false,
        },
        this.user.type !== 'PROPERTY' ? [] : [Validators.required, Validators.minLength(1)],
      ],
      address: [
        {
          value:
            !!this.user.locations[0] && !!this.user.locations[0].geolocation?.name
              ? this.user.locations[0].geolocation?.name
              : '',
          disabled: false,
        },
        [],
      ],
      geolocationName: [
        {
          value:
            !!this.user.locations[0] && !!this.user.locations[0].geolocation?.name
              ? this.user.locations[0].geolocation?.name
              : '',
          disabled: false,
        },
        [],
      ],
      geolocationCoordinates: [
        {
          value:
            !!this.user.locations[0] && !!this.user.locations[0].geolocation?.coordinates
              ? this.user.locations[0].geolocation?.coordinates
              : '',
          disabled: false,
        },
        [],
      ],
      supervisor: [
        {
          value:
            !!this.user.locations[0] && !!this.user.locations[0].supervisor
              ? this.user.locations[0].supervisor
              : '',
          disabled: false,
        },
        this.user.type !== 'PROPERTY' ? [] : [Validators.required, Validators.minLength(3)],
      ],
    });
  }

  editUser(): void {
    
    const userRaw = this.userForm.getRawValue();
    if (
      this.user.type !== 'SUPERVISOR' &&
      (userRaw.geolocationName === '' ||
        !userRaw.geolocationCoordinates ||
        userRaw.geolocationCoordinates.length === 0)
    ) {
      this.userForm.patchValue({
        address: '',
      });
      this.error = { message: 'Geolocation error.' };
      return;
    }

    this.error = null;
    this._fuseProgressBarService.show();

    let payload: any = {};
    payload.id = userRaw.id;
    if (this.user.username !== userRaw.username) {
      payload.username = userRaw.username;
    }

    if (!!this.isEditedPassword) {
      payload.password = userRaw.password;
    }

    if (this.user.first !== userRaw.first) {
      payload.first = userRaw.first;
    }
    if (this.user.last !== userRaw.last) {
      payload.last = userRaw.last;
    }
    if (this.user.deviceSerialNumber !== userRaw.deviceSerialNumber) {
      payload.deviceSerialNumber = userRaw.deviceSerialNumber;
    }
    if (this.user.banner != userRaw.banner) {
      payload.banner = this.bannerControl.value;
    }

    
    payload.clientCode = userRaw.clientCode;



    if (
      this.user.type === 'PROPERTY' &&
      !!this.user.locations &&
      this.user.locations.length > 0 &&
      !!this.user.locations[0] &&
      !!this.user.locations[0]._id
    ) {
      /* included in the payload as a reference, not for change
          rule: since location and property user is 1:1, no changing of location(id)
        */
      payload.location = this.user.locations[0]._id;
      if (this.user.locations[0].name !== userRaw.name) {
        payload.name = userRaw.name;
      }

      if (this.user.locations[0].supervisor !== userRaw.supervisor) {
        payload.supervisor = userRaw.supervisor;
      }

      if (
        this.user.locations[0].geolocation.name !== userRaw.geolocationName ||
        this.user.locations[0].geolocation.coordinates !== userRaw.geolocationCoordinates
      ) {
        payload.address = userRaw.geolocationName;
        payload.coordinates = userRaw.geolocationCoordinates;
      }
    }

    this.error = null;
    this._figmaService
      .updateUser(payload)
      .then((response) => {
        this.isEditMode = false;
        this._figmaService.setSelected(null);
        this.deselect.emit();
        this._matSnackBar.open('User updated successfully.', 'OK', {
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

  deleteContact(): void {
    this.confirmDialogRef = this._matDialog.open(FuseConfirmDialogComponent, {
      disableClose: false,
    });
    this.confirmDialogRef.componentInstance.confirmMessage =
      this.translate.instant('COMMON.DELETE_MSG');
    this.confirmDialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.error = null;
        this._fuseProgressBarService.show();
        this._figmaService
          .deleteUser(this.userForm.getRawValue())
          .then((response) => {
            this.isEditMode = false;
            this.userForm.reset();
            this._figmaService.setSelected(null);
            this.deselect.emit();
            this._figmaService.getAllDataUsers();
            this._matSnackBar.open(
              this.translate.instant('COMMON.USER_DELETED_SUCCESSFULLY'),
              this.translate.instant('COMMON.OK'),
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

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.bannerOptions.filter((option) => {
      return option.toLowerCase().includes(filterValue);
    });
  }
}
