import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { PackageService } from './figma.service';

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

  private _unsubscribeAll: Subject<any>;

  constructor(
    private _figmaService: PackageService,
    private _router: Router
  ) {
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
    this._figmaService.getAllDataSchedulesByLocationId();
  }
}
