import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { ConfigService } from 'app/store/services/config.service';
import { Configs } from 'core/constants';
import { Observable } from 'rxjs';

@Injectable()
export class CreateSupervisorService implements Resolve<any> {
  routeParams: any;
  product: any;
  basePathApi = '';

  constructor(private _httpClient: HttpClient, private _configService: ConfigService) {
    this.basePathApi = `${_configService.config.baseURL}${Configs.Api}`;
  }

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<any> | Promise<any> | any {
    this.routeParams = route.params;
  }

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
}
