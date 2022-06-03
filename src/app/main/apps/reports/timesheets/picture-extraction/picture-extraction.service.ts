import { pictureDummyData } from './picture-dummy';
import { tap } from 'rxjs/operators';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { ConfigService } from 'app/store/services/config.service';
import { Configs } from 'core/constants';
import * as moment from 'moment';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PictureExtractionService implements Resolve<any> {
  get basePathApi() {
    return `${this._configService.config.baseURL}${Configs.Api}`;
  }
  get headers() {
    const loggedInUserToken = localStorage.getItem('loggedInUserToken');
    return new HttpHeaders({
      Authorization: loggedInUserToken,
    });
  }

  constructor(private _httpClient: HttpClient, private _configService: ConfigService) {}

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<any> | Promise<any> | any {
    return new Promise((resolve, reject) => {
      Promise.all([]).then((res) => {
        resolve(res);
      }, reject);
    });
  }

  getPictureData(filters?: any) {
    const url = `${this.basePathApi}spreadsheet/reports/tasks/images`;

    return new Promise((resolve, reject) => {
      this._httpClient.post(url, { filters }, { headers: this.headers })
      // .pipe(
      //   tap((res:any) => {
      //     if (res && res.tasks) {
      //       res.tasks.forEach(task => task.date = moment(task.date))
      //     }
      //   })
      // )
      .subscribe(
        (response: any) => {
          // TODO: Raj -> after testing exclusive, please delete if statement
          if (this._configService.config.company === 'Development') {
            resolve(pictureDummyData);
          } else {
            
            resolve(response);
          }
        },
        (err) => {
          reject(err);
        }
      );
    });
  }
}
