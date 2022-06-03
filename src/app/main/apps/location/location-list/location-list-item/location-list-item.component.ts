import { Component, HostBinding, Input, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';

import { ALocation } from 'app/main/apps/location/location.model';
import { ActivatedRoute } from '@angular/router';
import { LocationService } from 'app/main/apps/location/location.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'location-list-item',
  templateUrl: './location-list-item.component.html',
  styleUrls: ['./location-list-item.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class LocationListItemComponent implements OnInit, OnDestroy {
  tags: any[];

  @Input()
  location: ALocation;

  @HostBinding('class.selected')
  selected: boolean;

  @HostBinding('class.completed')
  completed: boolean;

  @HostBinding('class.move-disabled')
  moveDisabled: boolean;

  private _unsubscribeAll: Subject<any>;

  /**
   * Constructor
   *
   * @param {LocationService} _locationService
   * @param {ActivatedRoute} _activatedRoute
   */
  constructor(private _locationService: LocationService, private _activatedRoute: ActivatedRoute) {
    // Disable move if path is not /all
    if (_activatedRoute.snapshot.url[0].path !== 'all') {
      this.moveDisabled = true;
    }

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
    // Set the initial values
    this.location = new ALocation(this.location);
    this.completed = this.location.completed;

    // Subscribe to update on tag change
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
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  /**
   * Toggle star
   */
  toggleStar(event): void {
    event.stopPropagation();

    this.location.toggleStar();
  }

  /**
   * Toggle Important
   */
  toggleImportant(event): void {
    event.stopPropagation();

    this.location.toggleImportant();
  }

  /**
   * Toggle Completed
   */
  toggleCompleted(event): void {
    event.stopPropagation();

    this.location.toggleCompleted();
  }
}
