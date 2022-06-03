import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
  TemplateRef,
  ViewChild,
  ViewChildren,
  ViewEncapsulation,
} from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { FuseConfirmDialogComponent } from '@fuse/components/confirm-dialog/confirm-dialog.component';
import { FuseProgressBarService } from '@fuse/components/progress-bar/progress-bar.service';
import { FusePerfectScrollbarDirective } from '@fuse/directives/fuse-perfect-scrollbar/fuse-perfect-scrollbar.directive';
import { Employee } from 'app/main/apps/employee/models/employee.model';
import { ALocation } from 'app/main/apps/location/location.model';
import * as moment from 'moment';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { PackageService } from '../../../figma.service';
import { Package } from '../../../package.model';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'figma-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class FigmaDetailComponent implements OnInit, OnDestroy, AfterViewInit {
  @Output() deselect: EventEmitter<any> = new EventEmitter();

  schedule: Package = null;
  isEditMode: boolean;
  error: any = null;
  formType: string = 'edit';
  scheduleForm: FormGroup;
  statuses = [
    'SCHEDULE.REGULAR',
    'SCHEDULE.HOLIDAY_WORK',
    'SCHEDULE.HOLIDAY_OFF',
    'SCHEDULE.OFF',
    'SCHEDULE.VACATION',
    'SCHEDULE.ABSENT',
    'SCHEDULE.EXCUSED',
    'SCHEDULE.SICK',
    'SCHEDULE.PERSONAL',
    'SCHEDULE.PACKAGE',
    'SCHEDULE.UNKNOWN',
  ];
  sortedStatuses: [];
  punchInStatuses = ['EARLY', 'PROMPT', 'LATE', 'UNKNOWN'];
  punchOutStatuses = ['EARLY', 'PROMPT', 'LATE', 'UNKNOWN'];
  selectedLocation: ALocation;

  dialogRef: any;
  confirmDialogRef: MatDialogRef<ElementRef>;

  schedules: Package[];
  filteredEmployees: Employee[] = [];
  locations: ALocation[] = [];

  private _unsubscribeAll: Subject<any>;
  figma: any;
  dialog: any;
  contact: any;
  replyInput: any;

  @ViewChild(FusePerfectScrollbarDirective)
  directiveScroll: FusePerfectScrollbarDirective;

  @ViewChildren('replyInput')
  replyInputField;

  @ViewChild('replyForm')
  replyForm: NgForm;

  @ViewChild("DeleteAllDialog") DeleteAllDialog: TemplateRef<ElementRef>;

  constructor(
    private _figmaService: PackageService,
    private _formBuilder: FormBuilder,
    private _fuseProgressBarService: FuseProgressBarService,
    public _matDialog: MatDialog,
    public _router: Router,
    private _matSnackBar: MatSnackBar,
    public _translateService: TranslateService
  ) {
    this._unsubscribeAll = new Subject();
  }

  ngOnInit(): void {
    this.schedule = this._figmaService.figma;
    this._figmaService.onCurrentFigmaChanged
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((figmaData) => {
        if (!!figmaData) {
          
          this.schedule = figmaData;
          this.selectedLocation = this.schedule.location;
          // this.filteredEmployees = [];
          // this.schedule.location.employees.forEach((emp) => {
          //   this.filteredEmployees.push(emp);
          // });
          this.scheduleForm = this.createScheduleForm();
        }
      });

    this._figmaService.onLocationsChanged
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((locations) => {
        if (!!locations) {
          this.locations = locations;
        }
      });
    this._figmaService.onEmployeesChanged
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((employees) => {
        if (!!employees) {
          this.filteredEmployees = employees;
        }
      });

    this.loadPrerequisites();
  }

  createScheduleForm(): FormGroup {
    const formTimeStart = moment(this.schedule.timeStart).local();
    const formTimeEnd = moment(this.schedule.timeEnd).local();
    const formPunchIn = moment(this.schedule.punchIn).local();
    const formPunchOut = moment(this.schedule.punchOut).local();
    return this._formBuilder.group({
      id: [this.schedule._id],
      batchId: [ this.schedule.batchId ],
      location: [
        {
          value: this.schedule.location._id,
          disabled: false,
        },
        [Validators.required, Validators.minLength(3)],
      ],
      employee: [
        {
          value: this.schedule.employee._id,
          disabled: false,
        },
        [Validators.required, Validators.minLength(3)],
      ],
      timeStartDate: [
        {
          value: this.schedule.timeStart ? formTimeStart : new Date(),
          disabled: true,
        },
        [Validators.required, Validators.minLength(3)],
      ],
      timeStartTime: [
        {
          value: this.schedule.timeStart
            ? `${formTimeStart.hour() < 10 ? '0' : ''}${formTimeStart.hour()}:${
                formTimeStart.minute() < 10 ? '0' : ''
              }${formTimeStart.minute()}`
            : '09:00',
          disabled: false,
        },
        [Validators.required, Validators.minLength(3)],
      ],
      timeEndDate: [
        {
          value: this.schedule.timeEnd ? formTimeEnd : new Date(),
          disabled: true,
        },
        [Validators.required, Validators.minLength(3)],
      ],
      timeEndTime: [
        {
          value: this.schedule.timeEnd
            ? `${formTimeEnd.hour() < 10 ? '0' : ''}${formTimeEnd.hour()}:${
                formTimeEnd.minute() < 10 ? '0' : ''
              }${formTimeEnd.minute()}`
            : '17:00',
          disabled: false,
        },
        [Validators.required, Validators.minLength(3)],
      ],
      // dateRangeStart: [
      //   {
      //     value: this.schedule.dateRangeStart ? this.schedule.dateRangeStart : new Date(),
      //     disabled: false,
      //   },
      // ],
      // dateRangeEnd: [
      //   {
      //     value: this.schedule.dateRangeEnd ? this.schedule.dateRangeEnd : new Date(),
      //     disabled: false,
      //   },
      // ],
      punchInDate: [
        {
          value: this.schedule.punchIn,
          disabled: false,
        },
      ],
      punchInTime: [
        {
          value: this.schedule.punchIn
            ? `${formPunchIn.hour() < 10 ? '0' : ''}${formPunchIn.hour()}:${
                formPunchIn.minute() < 10 ? '0' : ''
              }${formPunchIn.minute()}`
            : '',
          disabled: false,
        },
      ],
      // punchOutDate: [
      //   {
      //     value: this.schedule.punchOut,
      //     disabled: false,
      //   },
      // ],
      // punchOutTime: [
      //   {
      //     value: this.schedule.punchOut
      //       ? `${formPunchOut.hour() < 10 ? '0' : ''}${formPunchOut.hour()}:${
      //           formPunchOut.minute() < 10 ? '0' : ''
      //         }${formPunchOut.minute()}`
      //       : '',
      //     disabled: false,
      //   },
      // ],
      // status: [
      //   {
      //     value: this.schedule.status
      //       ? this.getTranslatableStatusType(this.schedule.status)
      //       : 'UNKNOWN',
      //     disabled: false,
      //   },
      //   [Validators.required, Validators.minLength(3)],
      // ],
      // punchInStatus: [
      //   {
      //     value: this.schedule.punchInStatus ? this.schedule.punchInStatus : 'UNKNOWN',
      //     disabled: false,
      //   },
      // ],
      // punchOutStatus: [
      //   {
      //     value: this.schedule.punchOutStatus ? this.schedule.punchOutStatus : 'UNKNOWN',
      //     disabled: false,
      //   },
      // ],
    });
  }

  focusTitleField(): void {
    setTimeout(() => {});
  }

  editSchedule(): void {
    this.error = null;
    this._fuseProgressBarService.show();
    this.error = null;
    this._fuseProgressBarService.show();
    this._figmaService
      .updateSchedule(this.scheduleForm.getRawValue())
      .then((response) => {
        this.isEditMode = false;
        this.scheduleForm.reset();
        this._figmaService.setSelected(null);
        this.deselect.emit();
        this._matSnackBar.open('Schedule updated successfully.', 'OK', {
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
    this.confirmDialogRef = this._matDialog.open(this.DeleteAllDialog, {
      disableClose: false,
    });

    this.confirmDialogRef.afterClosed().subscribe((result) => {
      if (result) {
        const payload = this.scheduleForm.getRawValue()
        if (!!!payload.batchId) {
          return this._matSnackBar.open('Unknown batch ID.', 'OK', {
            verticalPosition: 'top',
            duration: 2000,
          });
        }

        if (result === 'this' || result === 'all') {
          this.error = null;
          this._fuseProgressBarService.show();
          this._figmaService
            .deletePackage(payload, result === 'all')
            .then((response) => {
              this.isEditMode = false;
              this.scheduleForm.reset();
              this._figmaService.setSelected(null);
              this.deselect.emit();
  
              this._matSnackBar.open('Schedule deleted successfully.', 'OK', {
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
        } else {
          this._matSnackBar.open('Unknown selection.', 'OK', {
            verticalPosition: 'top',
            duration: 2000,
          });
        }

        
      }
      this.confirmDialogRef = null;
    });
  }

  onLocationSelectionChange(location: ALocation, event: any) {
    if (event.isUserInput) {
      this.filteredEmployees = [];
      this.selectedLocation = location;
      this.filteredEmployees = location.employees;
    }
  }

  reset() {}

  ngAfterViewInit(): void {}
  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
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

  loadPrerequisites() {
    this._fuseProgressBarService.show();
    Promise.all([this._figmaService.getAllLocations()])
      .then((response) => {})
      .catch((error) => {
        this.error = error;
      })
      .finally(() => {
        this._fuseProgressBarService.hide();
      });
  }

  getTranslatableStatusType(statusValue: string) {
    if (statusValue === 'REGULAR') {
      return 'SCHEDULE.REGULAR';
    } else if (statusValue === 'HOLIDAY-WORK') {
      return 'SCHEDULE.HOLIDAY_WORK';
    } else if (statusValue === 'HOLIDAY-OFF') {
      return 'SCHEDULE.HOLIDAY_OFF';
    } else if (statusValue === 'OFF') {
      return 'SCHEDULE.OFF';
    } else if (statusValue === 'VACATION') {
      return 'SCHEDULE.VACATION';
    } else if (statusValue === 'ABSENT') {
      return 'SCHEDULE.ABSENT';
    } else if (statusValue === 'EXCUSED') {
      return 'SCHEDULE.EXCUSED';
    } else if (statusValue === 'SICK') {
      return 'SCHEDULE.SICK';
    } else if (statusValue === 'PERSONAL') {
      return 'SCHEDULE.PERSONAL';
    } else {
      return 'SCHEDULE.UNKNOWN';
    }
  }
}
