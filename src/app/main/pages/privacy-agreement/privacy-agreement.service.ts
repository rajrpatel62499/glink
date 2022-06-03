import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { User } from 'app/main/apps/user/user.model';
import { ConfigService } from 'app/store/services/config.service';
import { Configs } from 'core/constants';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable()
export class PrivacyAgreementService implements Resolve<any> {
  routeParams: any;
  basePathApi = '';
  onAllUsersChanged: BehaviorSubject<any>;

  constructor(private _httpClient: HttpClient, private _configService: ConfigService) {
    this.basePathApi = `${_configService.config.baseURL}${Configs.Api}`;
    this.onAllUsersChanged = new BehaviorSubject([]);
  }

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
          const userList = response.users.map((user) => {
            return new User(user);
          });

          this.onAllUsersChanged.next(userList);
          resolve(userList);
        }, reject);
    });
  }

  updateUser(payload: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this._httpClient
        .put(`${this.basePathApi}${Configs.User}${payload.id}`, payload, {
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
}
