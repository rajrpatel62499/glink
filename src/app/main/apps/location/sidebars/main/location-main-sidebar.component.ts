import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';

import { LocationService } from 'app/main/apps/location/location.service';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { fuseAnimations } from '@fuse/animations';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'location-main-sidebar',
  templateUrl: './location-main-sidebar.component.html',
  styleUrls: ['./location-main-sidebar.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations,
})
export class LocationMainSidebarComponent implements OnInit, OnDestroy {
  folders: any[];
  filters: any[];
  tags: any[];
  accounts: object;
  selectedAccount: string;

  private _unsubscribeAll: Subject<any>;

  /**
   * Constructor
   *
   * @param {LocationService} _locationService
   * @param {Router} _router
   */
  constructor(private _locationService: LocationService, private _router: Router) {
    // Set the defaults
    this.accounts = {
      creapond: 'johndoe@creapond.com',
      withinpixels: 'johndoe@withinpixels.com',
    };
    this.selectedAccount = 'creapond';

    // Set the private defaults
    this._unsubscribeAll = new Subject();
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------

  /**
   * On init
   */
  ngOnInit(): void {
    this._locationService.onAllFiltersChanged
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((filters) => {
        this.filters = filters;
      });

    this._locationService.onAllTagsChanged
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((tags) => {
        this.tags = tags;
      });
  }

  /**
   * On destroy
   */
  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  /**
   * New location
   */
  newLocation(): void {
    this._router.navigate(['/apps/location/all']).then(() => {
      setTimeout(() => {
        this._locationService.onNewLocationClicked.next('');
      });
    });
  }
}
