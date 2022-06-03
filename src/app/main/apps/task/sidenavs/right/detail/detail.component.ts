import {
  AfterViewInit,
  Component,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
  ViewChildren,
  ViewEncapsulation
} from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { FuseConfirmDialogComponent } from '@fuse/components/confirm-dialog/confirm-dialog.component';
import { FuseProgressBarService } from '@fuse/components/progress-bar/progress-bar.service';
import { FusePerfectScrollbarDirective } from '@fuse/directives/fuse-perfect-scrollbar/fuse-perfect-scrollbar.directive';
import { ALocation } from 'app/main/apps/location/location.model';
import { User } from 'app/main/apps/user/user.model';
import * as moment from 'moment';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TaskService } from '../../../figma.service';
import { Task } from '../../../task.model';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'figma-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class FigmaDetailComponent implements OnInit, OnDestroy, AfterViewInit {
  @Output() deselect: EventEmitter<any> = new EventEmitter();

  task: Task = null;
  tags: any[];
  isEditMode: boolean;
  error: any = null;
  formType: string = 'edit';
  scheduleForm: FormGroup;
  dialogRef: any;
  confirmDialogRef: MatDialogRef<FuseConfirmDialogComponent>;

  private _unsubscribeAll: Subject<any>;

  locations: ALocation[] = [];
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

  entries = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];
  countEntries = [];
  recurrences = ['COMMON.SINGLE', 'COMMON.WEEKLY', 'COMMON.MONTHLY'];
  taskForm: FormGroup;
  properties: User[];

  constructor(
    private _figmaService: TaskService,
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
    this.task = this._figmaService.figma;
    this._figmaService.onCurrentFigmaChanged
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((figmaData) => {
        if (!!figmaData) {
          this.task = figmaData;
          this.countEntries = [1];
          this.formType = 'edit';
          this.taskForm = this.createTaskForm();

          // set count entry selection
          if (this.task.recurrence === 'SINGLE') {
            this.countEntries = [1];
            this.taskForm.controls['count'].setValue(1);
          } else {
            this.countEntries = this.entries;
          }

          // subscribe to changes in recurrence
          this.taskForm.controls['recurrence'].valueChanges.subscribe((value) => {
            if (value === 'SINGLE') {
              this.countEntries = [1];
              this.taskForm.controls['count'].setValue(1);
            } else {
              this.countEntries = this.entries;
            }
          });
        }
      });

    this._figmaService.onLocationsChanged
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((locations) => {
        if (!!locations) {
          this.locations = locations;
        }
      });

    this.loadPrerequisites();
  }

  createTaskForm(): FormGroup {
    const formTimeStart = moment(this.task.dateStart).local();
    const formTimeEnd = moment(this.task.dateEnd).local();

    return this._formBuilder.group({
      _id: [this.task._id],
      batchId: [this.task.batchId],
      title: [
        {
          value: this.task.title ? this.task.title : '',
          disabled: false,
        },
        [Validators.required, Validators.minLength(3)],
      ],
      description: [
        {
          value: this.task.description ? this.task.description : '',
          disabled: false,
        },
        [Validators.required, Validators.minLength(3)],
      ],
      timeStartTime: [
        {
          value: this.task.dateStart
            ? `${formTimeStart.hour() < 10 ? '0' : ''}${formTimeStart.hour()}:${
                formTimeStart.minute() < 10 ? '0' : ''
              }${formTimeStart.minute()}`
            : '09:00',
          disabled: false,
        },
        [Validators.required, Validators.minLength(3)],
      ],
      timeEndTime: [
        {
          value: this.task.dateEnd
            ? `${formTimeEnd.hour() < 10 ? '0' : ''}${formTimeEnd.hour()}:${
                formTimeEnd.minute() < 10 ? '0' : ''
              }${formTimeEnd.minute()}`
            : '17:00',
          disabled: false,
        },
        [Validators.required, Validators.minLength(3)],
      ],
      dateStart: [
        {
          value: this.task.dateStart
            ? this.task.dateStart
            : new Date(new Date().getTime() + 86400000),
          disabled: false,
        },
      ],
      dateEnd: [
        {
          value: this.task.dateEnd ? this.task.dateEnd : new Date(new Date().getTime() + 86400000),
          disabled: false,
        },
      ],
      recurrence: [
        {
          value: this.task.recurrence ? this.task.recurrence : 'SINGLE',
          disabled: false,
        },
        [Validators.required, Validators.minLength(3)],
      ],
      count: [
        {
          value: this.task.countEntries ? this.task.countEntries : 1,
          disabled: false,
        },
        [Validators.required, Validators.min(1)],
      ],
      property: [
        {
          value: this.task.property ? this.task.property._id : '',
          disabled: false,
        },
        [Validators.required, Validators.minLength(3)],
      ],
      isEditAll: [
        {
          value: false,
          disabled: false,
        },
        [],
      ],
      isImageRequired: [
        {
          value: this.task.isImageRequired,
          disabled: false,
        },
        [],
      ],
    });
  }
  focusTitleField(): void {
    setTimeout(() => {});
  }

  onClickSave(): void {
    this.error = null;
    this._fuseProgressBarService.show();
    this.error = null;
    this._fuseProgressBarService.show();

    const isSeriesEdit = this.taskForm.controls['isEditAll'].value;
    if (!!isSeriesEdit) {
      this._figmaService
        .updateTask(this.taskForm.getRawValue())
        .then((response) => {
          this.isEditMode = false;
          this.taskForm.reset();
          this._figmaService.setSelected(null);
          this.deselect.emit();
          this._figmaService.initialize(null);

          this._matSnackBar.open('Tasks updated successfully.', 'OK', {
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
      this.taskForm.patchValue({
        count: 1,
      });

      Promise.all([
        this._figmaService.deleteTask(this.taskForm.getRawValue()),
        this._figmaService.addTask(this.taskForm.getRawValue()),
      ])
        .then((response) => {
          this.isEditMode = false;
          this.taskForm.reset();
          this._figmaService.setSelected(null);
          this.deselect.emit();
          this._figmaService.initialize(null);

          this._matSnackBar.open('Tasks updated successfully.', 'OK', {
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
  }

  onClickDelete(): void {
    this.confirmDialogRef = this._matDialog.open(FuseConfirmDialogComponent, {
      disableClose: false,
    });

    this.confirmDialogRef.componentInstance.confirmMessage = this.translate.instant('COMMON.DELETE_MSG');
    this.confirmDialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.error = null;
        this._fuseProgressBarService.show();
        this._figmaService
          .deleteTask(this.taskForm.getRawValue())
          .then((response) => {
            this.isEditMode = false;
            this.taskForm.reset();
            this._figmaService.setSelected(null);
            this.deselect.emit();
            this._figmaService.initialize(null);
            this._matSnackBar.open(this.translate.instant('COMMON.TASK_DELETED'), this.translate.instant('COMMON.OK'), {
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
      this.confirmDialogRef = null;
    });
  }
  reset() {
    this.task = null;
    this.tags = [];
    this.formType = '';
    this.taskForm = null;
    this.isEditMode = false;
    this.error = null;
  }
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
    Promise.all([])
      .then((response) => {})
      .catch((error) => {
        this.error = error;
      })
      .finally(() => {
        this._fuseProgressBarService.hide();
      });
  }
}
