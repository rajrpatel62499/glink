import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Employee } from 'app/main/apps/employee/models/employee.model';
import { ALocation } from 'app/main/apps/location/location.model';
import { ConfigService } from 'app/store/services/config.service';
import { Configs } from 'core/constants';
import { BehaviorSubject, Observable } from 'rxjs';
import { User } from 'app/main/apps/user/user.model';

@Injectable()
export class CreatePackageService implements Resolve<any> {
  routeParams: any;
  basePathApi = '';
  onAllEmployeesChanged: BehaviorSubject<any>;
  onAllLocationsChanged: BehaviorSubject<any>;
  onAllUsersChanged: BehaviorSubject<any>;

  constructor(private _httpClient: HttpClient, private _configService: ConfigService) {
    this.basePathApi = `${_configService.config.baseURL}${Configs.Api}`;
    this.onAllEmployeesChanged = new BehaviorSubject([]);
    this.onAllUsersChanged = new BehaviorSubject([]);
    this.onAllLocationsChanged = new BehaviorSubject([]);
  }

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<any> | Promise<any> | any {
    this.routeParams = route.params;
    return new Promise((resolve, reject) => {
      Promise.all([
        this.getAllEmployees(),
        this.getAllLocations(), // main function to retrive the clients and it's employees. 
      ]).then(([users, employees]) => {
        resolve({ users, employees });
      }, reject);
    });
  }

  addPackage(payload): any {
    const url = `${this.basePathApi}timesheet/package`; 
    return new Promise((resolve, reject) => {
      this._httpClient
        .post(url, { package: payload}, {  headers: this.generateHttpHeaders()})
        .toPromise()
        .then((response) => {
          resolve(response);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  getAllEmployees(): Promise<any> {
    return new Promise((resolve, reject) => {
      this._httpClient
        .get(`${this.basePathApi}${Configs.Employee}`, {
          headers: this.generateHttpHeaders(),
        })
        .subscribe((response: any) => {
          const employeeList = response.employees.map((employee) => {
            return new Employee(employee);
          });

          this.onAllEmployeesChanged.next(employeeList);
          resolve(response);
        }, reject);
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

  private generateHttpHeaders(): HttpHeaders {
    const loggedInUserToken = localStorage.getItem('loggedInUserToken');

    return new HttpHeaders({
      Authorization: loggedInUserToken,
    });
  }
}
