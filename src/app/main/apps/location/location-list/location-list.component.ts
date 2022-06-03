import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';

import { ALocation } from 'app/main/apps/location/location.model';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { LocationService } from 'app/main/apps/location/location.service';
import { Subject } from 'rxjs';
import { fuseAnimations } from '@fuse/animations';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'location-list',
  templateUrl: './location-list.component.html',
  styleUrls: ['./location-list.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations,
})
export class LocationListComponent implements OnInit, OnDestroy {
  locations: ALocation[];

  private _unsubscribeAll: Subject<any>;

  /**
   * Constructor
   *
   * @param {ActivatedRoute} _activatedRoute
   * @param {LocationService} _locationService
   * @param {Location} _location
   */
  constructor(
    private _activatedRoute: ActivatedRoute,
    private _locationService: LocationService,
    private _location: Location
  ) {
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
    // Subscribe to update locations on changes
    this._locationService.onLocationsListChanged
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((locations) => {
        this.locations = locations;
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
   * Read location
   *
   * @param locationId
   */
  readLocation(locationId): void {}

  /**
   * On drop
   *
   * @param ev
   */
  onDrop(ev): void {}
}
