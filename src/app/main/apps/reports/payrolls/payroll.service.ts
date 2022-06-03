import { DateFrequency, ReportFilters } from './../timesheets/timesheet-model';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { ConfigService } from 'app/store/services/config.service';
import { Configs } from 'core/constants';
import * as moment from 'moment';
import { BehaviorSubject, Observable } from 'rxjs';
import { User } from '../../user/user.model';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class PayrollService implements Resolve<any> {
  frequency: string = DateFrequency.WEEKLY;

  onClientsListChanged: BehaviorSubject<any>;
  onClientEmployeesChanged: BehaviorSubject<any>;

  get basePathApi() {
    return `${this._configService.config.baseURL}${Configs.Api}`;
  }
  get headers() {
    const loggedInUserToken = localStorage.getItem('loggedInUserToken');
    return new HttpHeaders({
      Authorization: loggedInUserToken,
    });
  }

  constructor(private _httpClient: HttpClient, private _configService: ConfigService) {
    this.onClientsListChanged = new BehaviorSubject([]);
    this.onClientEmployeesChanged = new BehaviorSubject([]);
  }

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<any> | Promise<any> | any {
    return new Promise((resolve, reject) => {
      Promise.all([this.getAllDataUsers()]).then(([users]) => {
        resolve(users);
      }, reject);
    });
  }

  getAllDataUsers(): Promise<User[]> {
    return new Promise((resolve, reject) => {
      return this._httpClient
        .get(`${this.basePathApi}${Configs.User}`, {
          headers: this.headers,
        })
        .subscribe((result: any) => {
          const userList = result.users.map((user) => {
            return new User(user);
          });

          const clients = userList.filter((item) => {
            return item.type == 'PROPERTY';
          });

          this.onClientsListChanged.next(clients);

          resolve(userList);
        }, reject);
    });
  }

  getClientEmployees(filters?: ReportFilters) {
    const url = `${this.basePathApi}spreadsheet/reports/client/employees`;
    return new Promise((resolve, reject) => {
      this._httpClient
        .post(url, { filters }, { headers: this.headers })
        .pipe(
          tap((res: { employees: any[] }) => {
            // res?.clients ? res.clients.forEach(x => x.time = Number.parseFloat(x.time).toFixed(2)) : '';
          })
        )
        .subscribe((response: any) => {
          this.onClientEmployeesChanged.next(response);
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
      weeks: body.weeks,
      locations: body.locations,
      dateRangeEnd: dateRangeEndString,
    };

    return new Promise((resolve, reject) => {
      this._httpClient
        .post(
          `${this.basePathApi}${Configs.DownloadSpreadsheet}`,
          { filters: filters },
          {
            headers: this.headers,
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
