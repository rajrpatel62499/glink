import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { UserService } from '../../../figma.service';

@Component({
  selector: 'figma-left-drawer',
  templateUrl: './left-drawer.component.html',
  styleUrls: ['./left-drawer.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class FigmaLeftDrawerComponent implements OnInit, OnDestroy {
  user: any;
  userForm: FormGroup;

  private _unsubscribeAll: Subject<any>;

  constructor(private _figmaService: UserService) {
    this._unsubscribeAll = new Subject();
  }

  ngOnInit(): void {
    this.user = this._figmaService.user;

    this.userForm = new FormGroup({
      mood: new FormControl(this.user.mood),
      status: new FormControl(this.user.status),
    });

    this.userForm.valueChanges
      .pipe(takeUntil(this._unsubscribeAll), debounceTime(500), distinctUntilChanged())
      .subscribe((data) => {
        this.user.mood = data.mood;
        this.user.status = data.status;
      });
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }

  changeLeftSidenavView(view): void {
    this._figmaService.onLeftSidenavViewChanged.next(view);
  }
}
