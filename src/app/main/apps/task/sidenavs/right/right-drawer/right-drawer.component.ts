import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TaskService } from '../../../figma.service';

@Component({
  selector: 'figma-right-drawer',
  templateUrl: './right-drawer.component.html',
  styleUrls: ['./right-drawer.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class FigmaRightDrawerComponent implements OnInit, OnDestroy {
  contact: any;
  private _unsubscribeAll: Subject<any>;

  constructor(private _figmaService: TaskService) {
    this._unsubscribeAll = new Subject();
  }

  ngOnInit(): void {
    this._figmaService.onContactSelected
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((contact) => {
        this.contact = contact;
      });
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }
}
