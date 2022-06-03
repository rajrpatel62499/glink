import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';

import { ALocation } from 'app/main/apps/location/location.model';
import { FormControl } from '@angular/forms';
import { FuseSidebarService } from '@fuse/components/sidebar/sidebar.service';
import { LocationService } from 'app/main/apps/location/location.service';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { fuseAnimations } from '@fuse/animations';

@Component({
  selector: 'location',
  templateUrl: './location.component.html',
  styleUrls: ['./location.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations,
})
export class LocationComponent implements OnInit, OnDestroy {
  hasSelectedLocations: boolean;
  isIndeterminate: boolean;
  filters: any[];
  tags: any[];
  searchInput: FormControl;
  currentLocation: ALocation;

  private _unsubscribeAll: Subject<any>;

  /**
   * Constructor
   *
   * @param {FuseSidebarService} _fuseSidebarService
   * @param {LocationService} _locationService
   */
  constructor(
    private _fuseSidebarService: FuseSidebarService,
    private _locationService: LocationService,
    private _router: Router
  ) {
    this.searchInput = new FormControl('');

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
      .subscribe((folders) => {
        this.filters = this._locationService.filtersAll;
      });

    this._locationService.onAllTagsChanged
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((tags) => {
        this.tags = this._locationService.tagsAll;
      });

    this.searchInput.valueChanges
      .pipe(takeUntil(this._unsubscribeAll), debounceTime(300), distinctUntilChanged())
      .subscribe((searchText) => {
        this._locationService.searchTextChange(searchText);
      });

    this._locationService.onCurrentLocationChanged
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(([currentLocation, formType]) => {
        if (!currentLocation) {
          this.currentLocation = null;
        } else {
          this.currentLocation = currentLocation;
        }
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
   * Deselect current location
   */
  deselectCurrentLocation(): void {
    this._router.navigate(['/apps/location/temp']).then(() => {
      this._router.navigate(['/apps/location/all']);
      this._locationService.onCurrentLocationChanged.next([null, null]);
    });
  }

  /**
   * Toggle the sidebar
   *
   * @param name
   */
  toggleSidebar(name): void {
    this._fuseSidebarService.getSidebar(name).toggleOpen();
  }
}
