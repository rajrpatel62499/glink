import { Component, Input, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { fuseAnimations } from '@fuse/animations';
import { UserService } from './figma.service';
import { Router } from '@angular/router';

@Component({
  selector: 'figma',
  templateUrl: './figma.component.html',
  styleUrls: ['./figma.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations,
})
export class FigmaComponent implements OnInit, OnDestroy {
  selectedItem: any;
  header: any;
  isTerminated: boolean;

  private _unsubscribeAll: Subject<any>;

  constructor(private _figmaService: UserService, private _router: Router) {
    this._unsubscribeAll = new Subject();
  }

  ngOnInit(): void {
    this._figmaService.onCurrentFigmaChanged
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((figmaData) => {
        this.selectedItem = figmaData;
      });

    this._figmaService.onParamChanged.pipe(takeUntil(this._unsubscribeAll)).subscribe((item) => {
      if (!!item) {
        this.header = {
          title: item.title,
          path: item.banner,
          subpath: item.client,
          clientId: item.clientId,
          locationId: item.locationId,
        };
      }
    });

    this._figmaService.onIsTerminatedChanged
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((item) => {
        this.isTerminated = item;
      });
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }

  onClickBack(): void {
    this._router.navigate([`/apps/clients/banners`], {
      queryParams: {
        banner: this.header.path,
        client: this.header.subpath,
        clientId: this.header.clientId,
        locationId: this.header.locationId,
      },
    });
  }

  onDeSelect() {
    this.selectedItem = null;
    this._figmaService.getEmployeesByLocation(this.isTerminated);
  }
}
