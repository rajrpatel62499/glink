import { tap } from 'rxjs/operators';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { ConfigService } from 'app/store/services/config.service';
import { Configs } from 'core/constants';
import { BehaviorSubject, Observable } from 'rxjs';
import { Employee } from '../../employee/models/employee.model';
import { User } from '../../user/user.model';
import { TimeSheetClient, ReportFilters, TimeSheetEmployee } from './timesheet-model';
import { ALocation } from '../../location/location.model';

@Injectable({
  providedIn: 'root',
})
export class TimeSheetService implements Resolve<any> {
  onClientsListChanged: BehaviorSubject<any>;
  onAllEmployeesChanged: BehaviorSubject<any>;
  onTimeSheetEmployeeChanged: BehaviorSubject<any>;
  onTimeSheetClientChanged: BehaviorSubject<any>;
  onLocationsChanged: BehaviorSubject<any>; // employee detail selection
  locations: ALocation[]; // locations are clients.

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
    this.onAllEmployeesChanged = new BehaviorSubject([]);

    this.onTimeSheetEmployeeChanged = new BehaviorSubject([]);
    this.onTimeSheetClientChanged = new BehaviorSubject([]);
    
    this.onLocationsChanged = new BehaviorSubject([]);
  }

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<any> | Promise<any> | any {
    return new Promise((resolve, reject) => {
      Promise.all([
        this.getAllDataUsers(),
        // this.getAllEmployees(),

        this.getAllLocations(), // main function to retrive the clients and it's employees. 
        // this.getSpreadSheetEmployee(),
        // this.getSpreadSheetClient(),
      ]).then(([users, employees]) => {
        resolve({ users, employees });
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

  getAllEmployees(): Promise<any> {
    return new Promise((resolve, reject) => {
      this._httpClient
        .get(`${this.basePathApi}${Configs.Employee}`, {
          headers: this.headers,
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
          headers: this.headers,
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

  getSpreadSheetEmployee(filters?: ReportFilters) {
    const emptyObj = {
      count: 0,
      employees: [],
      total: '0.0'
    };
    
    const url = `${this.basePathApi}spreadsheet/reports/employee`;
    return new Promise((resolve, reject) => {
      
      
      if (filters.employees.length == 0) {
        this.onTimeSheetEmployeeChanged.next(emptyObj);
        resolve(emptyObj);
        return;
      }



      this._httpClient.post(url, {filters}, { headers: this.headers })
      .pipe(tap((res: { employees: TimeSheetEmployee[]})=>{
        res?.employees ? res.employees.forEach(x => x.time = Number.parseFloat(x.time).toFixed(2)) : '';
      }))
      .subscribe((response: any) => {
        this.onTimeSheetEmployeeChanged.next(response);
        resolve(response);
      }, reject);
    });
  }

  getSpreadSheetClient(filters?: ReportFilters) {
    const url = `${this.basePathApi}spreadsheet/reports/client`;
    return new Promise((resolve, reject) => {
      this._httpClient.post(url, {filters} , { headers: this.headers })
      .pipe(tap((res: { clients: TimeSheetClient[]})=>{
        res?.clients ? res.clients.forEach(x => x.time = Number.parseFloat(x.time).toFixed(2)) : '';
      }))
      .subscribe((response: any) => {
        this.onTimeSheetClientChanged.next(response);
        resolve(response);
      }, reject);
    });
  }


  //#region Util funcitons

  getEmployeesByLocationIds(locationIds: string[]) {
    const response = this.locations.filter((x) => locationIds.includes(x._id)) || [];
    const employees = <Employee[]>(
      (<unknown>[].concat(...(response.map((item) => item.employees) || [])))
    )
    return employees.filter(item => item.isActive);
  }

  public getParamsFromObj(obj): HttpParams {
    let params = new HttpParams();

    if (obj) {
      Object.keys(obj).forEach((key) => {
        if (obj[key] !== '' && obj[key] !== undefined) {
          params = params.set(key, obj[key]);
        }
      });
    }
    return params;
  }

  //#endregion
}
