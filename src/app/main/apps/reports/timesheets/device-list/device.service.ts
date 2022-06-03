import { ReportFilters } from './../timesheet-model';
import { tap, map, debounce } from 'rxjs/operators';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { ConfigService } from 'app/store/services/config.service';
import { Configs } from 'core/constants';
import * as moment from 'moment';
import { BehaviorSubject, concat, from, Observable, interval } from 'rxjs';
import * as chunkPromise from 'chunk-promise';
import { Device } from './models/device.model';

@Injectable({
  providedIn: 'root',
})
export class DeviceService implements Resolve<any> {
  get basePathApi() {
    return `${this._configService.config.baseURL}${Configs.Api}`;
  }
  get headers() {
    const loggedInUserToken = localStorage.getItem('loggedInUserToken');
    return new HttpHeaders({
      Authorization: loggedInUserToken,
    });
  }

  devicesMap: Map<string, Object> = new Map();
  deviceNotFoundMap: Map<string, Object> = new Map();
  allDevicesLoaded = false;

  constructor(private _httpClient: HttpClient, private _configService: ConfigService) {}

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<any> | Promise<any> | any {
    return new Promise((resolve, reject) => {
      Promise.all([
        // this.getAllDevices()
      ]).then((res) => {
        resolve(res);
      }, reject);
    });
  }

  getAllDevices(filters?: any) {
    const url = `${this.basePathApi}${Configs.Devices}`;
    return new Promise((resolve, reject) => {
      this._httpClient
        .post(url,  {filters} ,{ headers: this.headers })
        .pipe(
          map((res: any) => res?.devices),
          map((res) => {
            return {
              ...res,
              results: res.map((x) => {
                return new Device(x);
              }),
            };
          })
        )
        .subscribe((response: any) => {
          resolve(response);
        }, reject);
    });
  }
}
