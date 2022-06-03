import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { ALocation } from 'app/main/apps/location/location.model';
import { User } from 'app/main/apps/user/user.model';
import { ConfigService } from 'app/store/services/config.service';
import { Configs } from 'core/constants';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable()
export class CreatePropertyService implements Resolve<any> {
  routeParams: any;
  basePathApi = '';
  onAllUsersChanged: BehaviorSubject<any>;
  onAllLocationsChanged: BehaviorSubject<any>;

  constructor(private _httpClient: HttpClient, private _configService: ConfigService) {
    this.basePathApi = `${_configService.config.baseURL}${Configs.Api}`;
    this.onAllUsersChanged = new BehaviorSubject([]);
    this.onAllLocationsChanged = new BehaviorSubject([]);
  }

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<any> | Promise<any> | any {
    this.routeParams = route.params;
  }

  addUserAndLocation(payload): any {
    return new Promise((resolve, reject) => {
      this._httpClient
        .post(`${this.basePathApi}${Configs.User}`, payload, {
          headers: this.generateHttpHeaders(),
        })
        .subscribe((response: any) => {
          resolve(response);
        }, reject);
    });
  }

  private generateHttpHeaders(): HttpHeaders {
    const loggedInUserToken = localStorage.getItem('loggedInUserToken');

    return new HttpHeaders({
      Authorization: loggedInUserToken,
    });
  }

  getAllLocations(): Promise<any> {
    return new Promise((resolve, reject) => {
      this._httpClient
        .get(`${this.basePathApi}${Configs.ALocation}`, {
          headers: this.generateHttpHeaders(),
        })
        .subscribe((response: any) => {
          const locationList = response.locations.map((location) => {
            return new ALocation(location);
          });

          this.onAllLocationsChanged.next(locationList);
          resolve(response);
        }, reject);
      // }
    });
  }

  getAllUsers(): Promise<any> {
    return new Promise((resolve, reject) => {
      this._httpClient
        .get(`${this.basePathApi}${Configs.User}`, {
          headers: this.generateHttpHeaders(),
        })
        .subscribe((response: any) => {
          const userList = response.users.map((user) => {
            return new User(user);
          });

          this.onAllUsersChanged.next(userList);
          resolve(userList);
        }, reject);
    });
  }
}
