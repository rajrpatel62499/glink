import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { ConfigService } from 'app/store/services/config.service';
import { Configs } from 'core/constants';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { ALocation } from '../location/location.model';
import { Employee } from './models/employee.model';
import * as moment from 'moment';

@Injectable()
export class UserService implements Resolve<any> {
  onContactSelected: BehaviorSubject<any>;
  onUserUpdated: Subject<any>;
  onLeftSidenavViewChanged: Subject<any>;
  onRightSidenavViewChanged: Subject<any>;

  // user-service
  basePathApi = '';
  path = '';
  routeParams: any = null;
  queryParams: any = null;
  filtersAll: any[];
  tagsAll: any[];
  figma: Employee;
  locations: ALocation[];
  isTerminatedOnly: boolean = true;

  currentSearchText: string;
  onParamChanged: BehaviorSubject<any>;
  onFigmasListChanged: BehaviorSubject<any>;
  onCurrentFigmaChanged: BehaviorSubject<any>;
  onLocationsChanged: BehaviorSubject<any>; // employee detail selection
  onSearchTextChanged: BehaviorSubject<any>;
  onAllEmployeesChanged: BehaviorSubject<any>;
  onIsTerminatedChanged: BehaviorSubject<any>;

  constructor(private _httpClient: HttpClient, _configService: ConfigService) {
    this.onContactSelected = new BehaviorSubject(null);
    this.onUserUpdated = new Subject();
    this.onLeftSidenavViewChanged = new Subject();
    this.onRightSidenavViewChanged = new Subject();

    // user
    this.onFigmasListChanged = new BehaviorSubject([]);
    this.onCurrentFigmaChanged = new BehaviorSubject(null);
    this.onLocationsChanged = new BehaviorSubject([]);
    this.onSearchTextChanged = new BehaviorSubject('');
    this.onParamChanged = new BehaviorSubject(null);
    this.onAllEmployeesChanged = new BehaviorSubject([]);
    this.onIsTerminatedChanged = new BehaviorSubject(true);
    // base path
    this.basePathApi = `${_configService.config.baseURL}${Configs.Api}`;
  }

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<any> | Promise<any> | any {
    this.queryParams = route.queryParams;
    this.routeParams = route.params;
    this.path = route.routeConfig.path;
    this.setSelected(null);

    if (this.path == 'all') {
      return new Promise((resolve, reject) => {
        Promise.all([
          this.getAllLocations(),
          this.getEmployeesByLocation(this.isTerminatedOnly),
        ]).then(([users]) => {
          this.onParamChanged.next({ title: 'COMMON.EMPLOYEES' });
          resolve();
        }, reject);
      });
    } else if (this.path == 'location') {
      return new Promise((resolve, reject) => {
        Promise.all([
          this.getAllLocations(),
          this.getEmployeesByLocation(this.isTerminatedOnly),
        ]).then(([users]) => {
          this.onParamChanged.next(this.queryParams);
          resolve();
        }, reject);
      });
    }
  }

  generateHttpHeaders(): HttpHeaders {
    const loggedInUserToken = localStorage.getItem('loggedInUserToken');

    return new HttpHeaders({
      Authorization: loggedInUserToken,
    });
  }

  selectContact(contact): void {
    this.onContactSelected.next(contact);
  }

  setIsTerminatedOnly(isTerminatedOnly: boolean): void {
    this.isTerminatedOnly = isTerminatedOnly;
    this.onIsTerminatedChanged.next(isTerminatedOnly);
  }

  setSelected(item): void {
    if (!!item && !!item._id) {
      this.getEmployeeById(item._id)
        .then((response) => {
          this.onLocationsChanged.next(this.locations);
        })
        .catch((error) => {})
        .finally(() => {});
    } else {
      this.onCurrentFigmaChanged.next(null);
    }
  }

  setItems(items): void {
    this.onFigmasListChanged.next(items);
  }

  getEmployeesByLocation(isTerminatedOnly: boolean): Promise<Employee[]> {
    if (!!this.queryParams.locationId) {
      return new Promise((resolve, reject) => {
        this._httpClient
          .get(`${this.basePathApi}${Configs.ALocation}${this.queryParams.locationId}`, {
            headers: this.generateHttpHeaders(),
          })
          .subscribe((result: any) => {
            const location = new ALocation(result.location);
            var employees = location.employees as Employee[];
            employees = employees.filter(item => !!item.isActive);

            // filter locally, since there is only a limited number of employees per location
            if (isTerminatedOnly && !!employees) {
              employees = employees.filter((item) => {
                const itemDate = moment(item.hireDateEnd);
                const now = moment(new Date());
                const diff = itemDate.diff(now);

                return diff > 0;
              });
              this.onFigmasListChanged.next(employees);
            }

            this.onFigmasListChanged.next(employees);

            resolve(location.employees);
          }, reject);
      });
    } else {
      const filters: any = {};
      filters.isActive = true;

      if (!!isTerminatedOnly) {
        filters.hireDateEnd = moment(new Date());
      }

      return new Promise((resolve, reject) => {
        this._httpClient
          .post(
            `${this.basePathApi}${Configs.Employee}`,
            { filters },
            {
              headers: this.generateHttpHeaders(),
            }
          )
          .subscribe((result: any) => {
            const employees = result.employees.map((item) => {
              // more importantly, to apply UI elements like tags
              return new Employee(item);
            });
            this.onFigmasListChanged.next(employees);
            resolve(employees);
          }, reject);
      });
    }
  }

  getEmployeeById(id): Promise<Employee> {
    return new Promise((resolve, reject) => {
      this._httpClient
        .get(`${this.basePathApi}${Configs.Employee}${id}`, {
          headers: this.generateHttpHeaders(),
        })
        .subscribe((result: any) => {
          const employee = new Employee(result.employee);
          this.onCurrentFigmaChanged.next(employee);
          resolve(employee);
        }, reject);
    });
  }

  updateEmployee(employee): any {
    return new Promise((resolve, reject) => {
      this._httpClient
        .put(
          `${this.basePathApi}${Configs.Employee}${employee.id}`,
          { employee },
          {
            headers: this.generateHttpHeaders(),
          }
        )
        .toPromise()
        .then((response) => {
          resolve(response);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  resetPassword(userId: string, matricule: string): any {
    return new Promise((resolve, reject) => {
      this._httpClient
        .put(`${this.basePathApi}${Configs.User}${userId}/resetpassword`, 
        { matricule }, {
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

  checkFutureTimesheets(employeeId: string): any {
    return new Promise((resolve, reject) => {
      this._httpClient
        .get(
          `${this.basePathApi}${Configs.Timesheet}${Configs.Schedule}${Configs.Employee}${employeeId}`,
          {
            headers: this.generateHttpHeaders(),
          }
        )
        .toPromise()
        .then((response) => {
          resolve(response);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  deleteEmployee(userId): any {
    return new Promise((resolve, reject) => {
      this._httpClient
        .delete(`${this.basePathApi}${Configs.User}${userId}`, {
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

  getAllLocations(): Promise<any> {
    return new Promise((resolve, reject) => {
      this._httpClient
        .get(`${this.basePathApi}${Configs.ALocation}`, {
          headers: this.generateHttpHeaders(),
        })
        .toPromise()
        .then((response: any) => {
          this.locations = response.locations.map((item) => {
            return new ALocation(item);
          });

          this.onLocationsChanged.next(this.locations);
          resolve(this.locations);
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
}
