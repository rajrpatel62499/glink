import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { MediaObserver } from '@angular/flex-layout';
import { fuseAnimations } from '@fuse/animations';
import { FuseMatSidenavHelperService } from '@fuse/directives/fuse-mat-sidenav/fuse-mat-sidenav.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { UserService } from '../../../figma.service';
import * as _ from 'lodash';
import { FormControl } from '@angular/forms';
import * as moment from 'moment';

@Component({
  selector: 'figma-figmas',
  templateUrl: './figmas.component.html',
  styleUrls: ['./figmas.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations,
})
export class FigmasComponent implements OnInit, OnDestroy {
  figmas: any[];
  searchText: string;
  isNotTerminated = new FormControl(true, []);

  private _unsubscribeAll: Subject<any>;

  constructor(
    private _figmaService: UserService,
    private _fuseMatSidenavHelperService: FuseMatSidenavHelperService,
    public _mediaObserver: MediaObserver
  ) {
    this.searchText = '';
    this._unsubscribeAll = new Subject();
  }

  ngOnInit(): void {
    this._figmaService.onFigmasListChanged
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((employees) => {
        this._figmaService.setSelected(null);
        this.figmas = _.orderBy(employees, ['first'], ['asc']);
      });
    this.isNotTerminated.valueChanges.subscribe((newToogleValue) => {
      this._figmaService.setSelected(null);
      this._figmaService.setIsTerminatedOnly(newToogleValue);
      this._figmaService.getEmployeesByLocation(newToogleValue);
    });
  }

  ngOnDestroy(): void {
    this.figmas = [];
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }

  setUserStatus(status): void {}

  changeLeftSidenavView(view): void {
    this._figmaService.onLeftSidenavViewChanged.next(view);
  }

  logout(): void {}

  onClickChip(item) {
    this._figmaService.setSelected(item);

    if (!this._mediaObserver.isActive('gt-md')) {
      this._fuseMatSidenavHelperService.getSidenav('chat-left-sidenav').toggle();
    }
  }

  onSearchChanged(text): void {
    this.searchText = text;
  }
}
