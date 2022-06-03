import { HttpClient, HttpEvent, HttpHeaders, HttpParams, HttpResponse } from '@angular/common/http';

import { ConfigService } from './config.service';
import { Configs } from 'core/constants';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from '../states/user/user.model';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  basePathApi = '';
  constructor(protected httpClient: HttpClient, _configService: ConfigService) {
    // base path
    this.basePathApi = `${_configService.config.baseURL}${Configs.Api}`;
  }

  // /**
  //  * Login User
  //  *
  //  * @param body username + password
  //  * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
  //  * @param reportProgress flag to report request and response progress.
  //  */
  // public login(body: any, observe?: 'body', reportProgress?: boolean): Observable<any>;
  // public login(
  //   body: any,
  //   observe?: 'response',
  //   reportProgress?: boolean
  // ): Observable<HttpResponse<any>>;
  // public login(body: any, observe?: 'events', reportProgress?: boolean): Observable<HttpEvent<any>>;
  // public login(body: any, observe: any = 'body', reportProgress: boolean = false): Observable<any> {
  //   if (body === null || body === undefined) {
  //     throw new Error('Required parameter body was null or undefined when calling login.');
  //   }
  //   return this.httpClient.post<any>(`${this.basePathApi}${Configs.Auth.toString()}`, body, {
  //     observe,
  //     reportProgress,
  //   });
  // }

  /**
   * Signoff assessment
   *
   * @param body assessment
   * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
   * @param reportProgress flag to report request and response progress.
   */
  public login(body: any, observe?: 'body', reportProgress?: boolean): Observable<any>;
  public login(
    body: any,
    observe?: 'response',
    reportProgress?: boolean
  ): Observable<HttpResponse<any>>;
  public login(body: any, observe?: 'events', reportProgress?: boolean): Observable<HttpEvent<any>>;
  public login(body: any, observe: any = 'body', reportProgress: boolean = false): Observable<any> {
    if (body === null || body === undefined) {
      throw new Error(
        'Required parameter body was null or undefined when calling signoffAssessment.'
      );
    }

    return this.httpClient.post<any>(`${this.basePathApi}${Configs.Auth.toString()}`, body, {
      observe,
      reportProgress,
    });
  }

  public getUserProfile(
    userId?: string,
    observe?: 'body',
    reportProgress?: boolean
  ): Observable<User>;
  public getUserProfile(
    userId?: string,
    observe?: 'response',
    reportProgress?: boolean
  ): Observable<HttpResponse<User>>;
  public getUserProfile(
    userId?: string,
    observe?: 'events',
    reportProgress?: boolean
  ): Observable<HttpEvent<User>>;
  public getUserProfile(
    userId?: string,
    observe: any = 'body',
    reportProgress: boolean = false
  ): Observable<any> {
    if (userId === undefined || userId === null) {
      throw new Error('UserId required.');
    }
    const loggedInUserToken = localStorage.getItem('loggedInUserToken');

    const httpHeaders: HttpHeaders = new HttpHeaders({
      Authorization: loggedInUserToken,
    });

    return this.httpClient
      .get<User>(`${this.basePathApi}${Configs.User}${userId}`, {
        headers: httpHeaders,
        observe,
        reportProgress,
      })
      .pipe(
        map((response) => {
          return (response as any).user;
        })
      );
  }
}
