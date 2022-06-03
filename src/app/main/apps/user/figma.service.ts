import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { ConfigService } from 'app/store/services/config.service';
import { Configs } from 'core/constants';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { User } from './user.model';

@Injectable({
  providedIn: 'root',
})
export class UserService implements Resolve<any> {
  onContactSelected: BehaviorSubject<any>;
  onUserUpdated: Subject<any>;
  onLeftSidenavViewChanged: Subject<any>;
  onRightSidenavViewChanged: Subject<any>;
  onEulaUpdated: Subject<any>;

  // user-service
  basePathApi = '';
  path = '';
  routeParams: any = null;
  usersAll: User[];
  filtersAll: any[];
  tagsAll: any[];
  user: User;

  currentSearchText: string;
  onParamChanged: BehaviorSubject<any>;
  onFigmasListChanged: BehaviorSubject<any>;
  onFigmasListUnfilteredChanged: BehaviorSubject<any>;
  onSupervisorListChanged: BehaviorSubject<any>;
  onCurrentFigmaChanged: BehaviorSubject<any>;
  onSearchTextChanged: BehaviorSubject<any>;
  

  constructor(private _httpClient: HttpClient, _configService: ConfigService) {
    this.onContactSelected = new BehaviorSubject(null);
    this.onUserUpdated = new Subject();
    this.onLeftSidenavViewChanged = new Subject();
    this.onRightSidenavViewChanged = new Subject();

    // user
    this.onFigmasListChanged = new BehaviorSubject([]);
    this.onFigmasListUnfilteredChanged = new BehaviorSubject([]);
    this.onSupervisorListChanged = new BehaviorSubject([]);
    this.onCurrentFigmaChanged = new BehaviorSubject(null);
    this.onSearchTextChanged = new BehaviorSubject('');
    this.onParamChanged = new BehaviorSubject(null);
    this.onEulaUpdated = new BehaviorSubject([]);

    // base path
    this.basePathApi = `${_configService.config.baseURL}${Configs.Api}`;
  }

  

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<any> | Promise<any> | any {
    const queryParams = route.queryParams;
    this.routeParams = route.params;
    this.path = route.routeConfig.path;
    this.setSelected(null);
    

    if (this.path == 'super') {
      return new Promise((resolve, reject) => {
        Promise.all([this.getAllDataUsers()]).then(([users]) => {
          this.onParamChanged.next({ title: 'COMMON.SUPERVISORS' });
          resolve();
        }, reject);
      });
    } else if (this.path == ':id') {
      return new Promise((resolve, reject) => {
        Promise.all([this.getAllDataUsers()]).then(([users]) => {
          if (!!users && users.length > 0) {
            this.setSelected(users[0]);
          }
          this.onParamChanged.next(queryParams);
          resolve();
        }, reject);
      });
    }
  }

  getAllFilters(): Promise<any> {
    return new Promise((resolve, reject) => {
      this._httpClient.get('api/user-filters').subscribe((response: any) => {
        this.filtersAll = response;
      }, reject);
    });
  }

  getAllTags(): Promise<any> {
    return new Promise((resolve, reject) => {
      this._httpClient.get('api/user-tags').subscribe((response: any) => {
        this.tagsAll = response;
      }, reject);
    });
  }

  getAllDataUsers(): Promise<User[]> {
    return new Promise((resolve, reject) => {
      return this._httpClient
        .get(`${this.basePathApi}${Configs.User}`, {
          headers: this.generateHttpHeaders(),
        })
        .subscribe((result: any) => {
          const userList = result.users.map((user) => {
            return new User(user);
          });
          this.onFigmasListUnfilteredChanged.next(userList);

          const supervisors = userList.filter((item) => {
            return item.type == 'SUPERVISOR';
          });

          if (this.path === 'super') {
            this.usersAll = supervisors;
          } else if (this.path === ':id') {
            this.usersAll = userList.filter((item) => {
              return item._id == this.routeParams.id;
            });
          } else {
            
          }

          this.onSupervisorListChanged.next(supervisors);
          this.onFigmasListChanged.next(this.usersAll);

          resolve(this.usersAll);
        }, reject);
    });
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

  // ken : this triggers the right-drawer
  setSelected(item): void {
    this.onCurrentFigmaChanged.next(item);
  }

  setItems(items): void {
    this.onFigmasListChanged.next(items);
  }

  deleteUser(user): Promise<any> {
    return new Promise((resolve, reject) => {
      this._httpClient
        .delete(`${this.basePathApi}${Configs.User}${user.id}`, {
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

  updateEula(payload: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this._httpClient
        .put(`${this.basePathApi}${Configs.User}${payload.id}`, payload, {
          headers: this.generateHttpHeaders(),
        })
        .toPromise()
        .then((response: any) => {
          resolve(response.newUser);
          this.onEulaUpdated.next(response.newUser);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }
}
