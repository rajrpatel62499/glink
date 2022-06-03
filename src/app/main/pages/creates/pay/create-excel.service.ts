import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { ConfigService } from 'app/store/services/config.service';
import { Configs } from 'core/constants';
import * as moment from 'moment';
import { Observable } from 'rxjs';

@Injectable()
export class CreateExcelService implements Resolve<any> {
  routeParams: any;
  product: any;
  basePathApi = '';

  /**
   * Constructor
   *
   * @param {HttpClient} _httpClient
   */
  constructor(private _httpClient: HttpClient, private _configService: ConfigService) {
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
    this.routeParams = route.params;
  }

  getAllUsers(): Promise<any> {
    return new Promise((resolve, reject) => {
      this._httpClient
        .get(`${this.basePathApi}${Configs.User}`, {
          headers: this.generateHttpHeaders(),
        })
        .subscribe((response: any) => {
          this.product = response;
          resolve(response);
        }, reject);
    });
  }
  
  /**
   * Add the alocation
   *
   * @param employee
   * @returns {Promise<any>}
   */
  addUser(user): any {
    return new Promise((resolve, reject) => {
      this._httpClient
        .post(`${this.basePathApi}${Configs.User}`, user, {
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

  /**
   * Get locations by params
   *
   * @param handle
   * @returns {Promise<ALocation[]>}
   */
  getAllLocations(): Promise<any> {
    return new Promise((resolve, reject) => {
      this._httpClient
        .get(`${this.basePathApi}${Configs.ALocation}`, {
          headers: this.generateHttpHeaders(),
        })
        .subscribe((response: any) => {
          this.product = response;
          resolve(response);
        }, reject);
    });
  }

  generateSpreadsheet(body): Promise<string> {
    if (!body || !body.dateRangeEnd) {
      return Promise.resolve('');
    }

    const dateRangeEnd = moment(body.dateRangeEnd).startOf('day');
    const dateRangeEndString = dateRangeEnd.format('YYYY-MM-DDTHH:mm:ss.ssZ');
    const dayOfWeek = dateRangeEnd.isoWeekday();

    if (dayOfWeek != 6) {
      return Promise.resolve('');
    }

    const filters = {
      dateRangeEnd: dateRangeEndString,
    };

    return new Promise((resolve, reject) => {
      this._httpClient
        .post(
          `${this.basePathApi}${Configs.DownloadSpreadsheet}`,
          { filters: filters },
          {
            headers: this.generateHttpHeaders(),
          }
        )
        .subscribe((result: any) => {
          if (!result || !result.s3Output) {
            return Promise.resolve('');
          }

          resolve(result.s3Output);
        }, reject);
    });
  }
}
