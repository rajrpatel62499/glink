import * as _ from 'lodash';

import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { ALocation } from 'app/main/apps/location/location.model';
import { ConfigService } from 'app/store/services/config.service';
import { Configs } from 'core/constants';
import { FuseUtils } from '@fuse/utils';
import { Injectable } from '@angular/core';
import { Location } from '@angular/common';
import { User } from '../user/user.model';

// import { User } from '../user/user.model';

@Injectable()
export class LocationService implements Resolve<any> {
  // protected basePathApi = `${Configs.BasePath.toString()}${Configs.Api}`;
  basePathApi = "";
  locationsAll: ALocation[];
  filtersAll: any[];
  tagsAll: any[];

  currentSearchText: string;
  currentTagHandle: string;

  onLocationsListChanged: BehaviorSubject<any>;
  onCurrentLocationChanged: BehaviorSubject<any>;

  onLocationSearchTextChanged: BehaviorSubject<any>;
  onNewLocationClicked: Subject<any>;

  onAllFiltersChanged: BehaviorSubject<any>;
  onAllTagsChanged: BehaviorSubject<any>;

  // exclusive
  onAllSupervisorsChanged: BehaviorSubject<any>;
  onAllPropertiesChanged: BehaviorSubject<any>;
  colors = ['#388E3C', '#FF9800', '#0091EA', '#9C27B0'];

  /**
   * Constructor
   *
   * @param {HttpClient} _httpClient
   * @param {Location} _location
   */
  constructor(private _httpClient: HttpClient, private _location: Location, _configService: ConfigService) {
    this.onLocationsListChanged = new BehaviorSubject([]);
    this.onCurrentLocationChanged = new BehaviorSubject([]);
    this.onAllFiltersChanged = new BehaviorSubject([]);
    this.onAllTagsChanged = new BehaviorSubject([]);
    this.onLocationSearchTextChanged = new BehaviorSubject('');
    this.onNewLocationClicked = new Subject();

    // new
    this.onAllSupervisorsChanged = new BehaviorSubject([]);
    this.onAllPropertiesChanged = new BehaviorSubject([]);

    // base path
    this.basePathApi = `${_configService.config.baseURL}${Configs.Api}`;
  }

  /**
   * Resolver
   *
   * @param {ActivatedRouteSnapshot} route
   * @param {RouterStateSnapshot} state
   * @returns {Observable<any> | Promise<any> | any}
   */
  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<any> | Promise<any> | any {
    const routeParams = route.params;
    const path = route.routeConfig.path;

    if (path == 'all') {
      this.currentSearchText = null;
      this.currentTagHandle = null;
      Promise.all([this.getAllFilters(), this.getAllUsers(), this.getAllDataLocations()]).then(
        (result) => {
          // generate dynamic tags
          const users = result[1].users;
          if (!!users && users.length > 0) {
            const responseUsers = users.map((item) => {
              return new User(item);
            });

            const supervisors = responseUsers.filter((user) => {
              return user.type == 'SUPERVISOR';
            });

            // for every supervisor, create a tag
            var tags = [];
            tags.push({
              id: 0,
              handle: 'unknown',
              title: 'Unknown',
              color: '#F44336',
            });

            for (var i = 0; i < supervisors.length; i++) {
              const superItem = supervisors[i];
              const index = i % 4;
              tags.push({
                handle: superItem.username,
                id: i + 1,
                color: this.colors[index],
                title: superItem.username,
              });
            }

            this.onAllTagsChanged.next(_.uniqBy(tags, 'handle'));

            // apply the tags to the locations
            const locations = result[2];

            if (!!locations && locations.length > 0) {
              const updatedLocations = locations.map((location) => {
                // more importantly, to apply UI elements like tags
                const locItem = new ALocation(location);
                const foundTags = tags.find((tagItem) => {
                  return locItem.supervisor && tagItem.handle == locItem.supervisor.username;
                });

                if (!!foundTags) {
                  locItem.tags = [foundTags];
                }
                return locItem;
              });

              this.locationsAll = updatedLocations;
            } else {
              this.locationsAll = [];
            }

            this.onLocationsListChanged.next(this.locationsAll);
          } else {
            this.onLocationsListChanged.next([]);
          }
        }
      );
    } else if (path == 'all/:locationId') {
      this.setCurrentLocation(route.params.locationId);
    } else if (path == 'tag/:tagHandle') {
      this.currentTagHandle = routeParams.tagHandle;
      this.onLocationsListChanged.next(this.getFilteredLocations());
    }
  }

  private getFilteredLocations(): ALocation[] {
    var filteredItems = this.locationsAll;
    if (!!!filteredItems || (!!filteredItems && filteredItems.length == 0)) {
      return [];
    }

    if (!!this.currentTagHandle) {
      filteredItems = filteredItems.filter((item) => {
        return item.tags.find((tag) => {
          return tag.handle === this.currentTagHandle;
        });
      });
    }

    if (!!this.currentSearchText) {
      filteredItems = filteredItems.filter((item) => {
        return this.containsDeepSearchMatch(item, this.currentSearchText);
      });
    }

    return filteredItems;
  }

  searchTextChange(searchText: string) {
    this.currentSearchText = searchText;
    this.onLocationsListChanged.next(this.getFilteredLocations());
  }

  containsDeepSearchMatch(object: any, searchText: string): boolean {
    let isMatched = false;

    _.cloneDeepWith(object, (v, k) => {
      if (!!isMatched) {
        return;
      }

      const value = !!v && v.toString().toLowerCase();
      if (!!value && value.includes(searchText.toLowerCase())) {
        isMatched = true;
      }
    });
    return isMatched;
  }

  /**
   * Get all filters
   *
   * @returns {Promise<any>}
   */
  getAllFilters(): Promise<any> {
    return new Promise((resolve, reject) => {
      this._httpClient.get('api/location-filters').subscribe((response: any) => {
        this.filtersAll = response;
        this.onAllFiltersChanged.next(this.filtersAll);
        resolve(this.filtersAll);
      }, reject);
    });
  }

  /**
   * Set current location by id
   *
   * @param id
   */
  private setCurrentLocation(id): void {
    const foundLocation = this.locationsAll.find((location) => {
      return location._id === id;
    });

    if (!foundLocation) {
      return;
    }

    this.onCurrentLocationChanged.next([foundLocation, 'edit']);
  }

  unsetCurrentLocation(): void {
    // this._location.go("apps/users/all/");
    this.onCurrentLocationChanged.next([null, null]);
  }

  /**
   * Get locations by params
   *
   * @returns {Promise<ALocation[]>}
   */
  getAllDataLocations(): Promise<ALocation[]> {
    return new Promise((resolve, reject) => {
      this._httpClient
        .get(`${this.basePathApi}${Configs.ALocation}`, {
          headers: this.generateHttpHeaders(),
        })
        .subscribe((result: any) => {
          resolve(result.locations);
        }, reject);
    });
  }

  /**
   * Add the alocation
   *
   * @param alocation
   * @returns {Promise<any>}
   */
  addLocation(alocation): any {
    alocation.employees = [];
    return new Promise((resolve, reject) => {
      this._httpClient
        .post(
          `${this.basePathApi}${Configs.ALocation}`,
          { location: alocation },
          {
            headers: this.generateHttpHeaders(),
          }
        )
        .toPromise()
        .then((response) => {
          resolve(response);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  /**
   * Update the alocation
   *
   * @param alocation
   * @returns {Promise<any>}
   */
  updateLocation(alocation): any {
    const updatedUser = {
      name: alocation.name,
      address: alocation.address,
      startTime: alocation.startTime,
      endTime: alocation.endTime,
      supervisor: alocation.supervisor,
      property: alocation.property,
    };

    return new Promise((resolve, reject) => {
      this._httpClient
        .put(`${this.basePathApi}${Configs.ALocation}${alocation.id}`, updatedUser, {
          headers: this.generateHttpHeaders(),
        })
        .toPromise()
        .then((response) => {
          resolve(response);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  /**
   * Delete the alocation
   *
   * @param alocation
   * @returns {Promise<any>}
   */
  deleteLocation(alocation): any {
    return new Promise((resolve, reject) => {
      this._httpClient
        .delete(`${this.basePathApi}${Configs.ALocation}${alocation.id}`, {
          headers: this.generateHttpHeaders(),
        })
        .toPromise()
        .then((response) => {
          resolve(response);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  private generateHttpHeaders(): HttpHeaders {
    const loggedInUserToken = localStorage.getItem('loggedInUserToken');

    return new HttpHeaders({
      Authorization: loggedInUserToken,
    });
  }

  /**
   * Get locations by params
   *
   * @param handle
   * @returns {Promise<Alocation[]>}
   */
  getAllUsers(): Promise<any> {
    return new Promise((resolve, reject) => {
      this._httpClient
        .get(`${this.basePathApi}${Configs.User}`, {
          headers: this.generateHttpHeaders(),
        })
        .toPromise()
        .then((response) => {
          resolve(response);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }
}
