import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { PackageService } from '../../figma.service';

@Component({
  selector: 'figma-right',
  templateUrl: './right.component.html',
  styleUrls: ['./right.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations,
})
export class FigmaRightComponent implements OnInit, OnDestroy {
  view: string;

  private _unsubscribeAll: Subject<any>;

  constructor(private _figmaService: PackageService) {
    this.view = 'contact';
    this._unsubscribeAll = new Subject();
  }

  ngOnInit(): void {
    this._figmaService.onRightSidenavViewChanged
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((view) => {
        this.view = view;
      });
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }
}
