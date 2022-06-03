import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Configs } from 'core/constants';
import { BehaviorSubject } from 'rxjs';
import { Flag } from '../models/flag.model';
import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root',
})
export class FeatureFlagService {
  onFlagsChanged: BehaviorSubject<any>;

  get basePathApi() {
    return `${this._configService.config.baseURL}${Configs.Api}`;
  }
  get headers() {
    const loggedInUserToken = localStorage.getItem('loggedInUserToken');
    return new HttpHeaders({
      Authorization: loggedInUserToken,
    });
  }

  constructor(private http: HttpClient, private _configService: ConfigService) {
    this.onFlagsChanged = new BehaviorSubject(null);
  }

  getAllFlags(): Promise<any> {
    console.log(`get all flags fired...`);
    return new Promise((resolve, reject) => {
      this.http
        .get(`${this.basePathApi}${Configs.Flag.toString()}`, {
          headers: this.generateHttpHeaders(),
        })
        .toPromise()
        .then((response: any) => {
          const flags = new Flag(response.flag);
          this.onFlagsChanged.next(flags);
          resolve(flags);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  generateHttpHeaders(): HttpHeaders {
    const loggedInUserToken = localStorage.getItem('loggedInUserToken');

    return new HttpHeaders({
      Authorization: loggedInUserToken,
    });
  }
}
