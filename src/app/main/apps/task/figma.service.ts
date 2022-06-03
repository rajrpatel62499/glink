import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { ConfigService } from 'app/store/services/config.service';
import { Configs } from 'core/constants';
import * as _ from 'lodash';
import * as moment from 'moment';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { User } from '../user/user.model';
import { Task } from './task.model';

@Injectable()
export class TaskService implements Resolve<any> {
  onContactSelected: BehaviorSubject<any>;
  onUserUpdated: Subject<any>;
  onLeftSidenavViewChanged: Subject<any>;
  onRightSidenavViewChanged: Subject<any>;
  basePathApi = '';
  path = '';
  routeParams: any = null;
  figmasAll: Task[];
  filtersAll: any[];
  tagsAll: any[] = [];
  figma: Task;
  locationId: string;

  filterDateRangeStart = new Date();
  filterDateRangeEnd = new Date();
  filterLocation = null;
  currentSearchText: string;
  currentTagHandle: string;
  onFiltersAllChanged: BehaviorSubject<any>;
  onTagsAllChanged: BehaviorSubject<any>;
  onDateRangeEndChanged: Subject<any>;

  colors = ['#388E3C', '#FF9800', '#0091EA', '#9C27B0'];
  tagsAllByUser: any[];
  onParamChanged: BehaviorSubject<any>;
  onFigmasListChanged: BehaviorSubject<any>;
  onCurrentFigmaChanged: BehaviorSubject<any>;
  onLocationsChanged: BehaviorSubject<any>; // employee detail selection
  onSearchTextChanged: BehaviorSubject<any>;

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

    // schedule
    this.onFiltersAllChanged = new BehaviorSubject(null);
    this.onTagsAllChanged = new BehaviorSubject(null);
    this.onDateRangeEndChanged = new BehaviorSubject(null);

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

    this.currentSearchText = null;
    this.currentTagHandle = null;
    this.setSelected(null);

    if (this.path == 'all') {
      return new Promise((resolve, reject) => {
        Promise.all([this.initialize(null)]).then(([schedules]) => {
          this.onParamChanged.next({ title: 'COMMON.TASKS' });
          resolve();
        }, reject);
      });
    } else if (this.path == 'location') {
      this.locationId = queryParams.locationId;
      return new Promise((resolve, reject) => {
        Promise.all([this.initialize(queryParams.clientId)]).then(([users]) => {
          if (!!users) {
            this.onFigmasListChanged.next([]);
          }
          this.onParamChanged.next(queryParams);
          resolve();
        }, reject);
      });
    }
  }

  initialize(propertyId: string): Promise<any> {
    this.currentSearchText = null;
    this.currentTagHandle = null;
    return Promise.all([
      this.getAllFilters(),
      this.getAllUsers(),
      this.getAllEmployees(),
      this.getAllDataTasks({ propertyId }),
    ]).then((result) => {
      // generate dynamic tags
      const users = result[1].users;
      if (!!users && users.length > 0) {
        const responseUsers = users.map((item) => {
          return new User(item);
        });

        // for every supervisor, create a tag
        var tags = [];
        tags.push({
          id: 0,
          handle: 'unknown',
          title: 'Unknown',
          color: '#F44336',
          type: '',
        });

        for (var i = 0; i < responseUsers.length; i++) {
          const userItem = responseUsers[i];
          const index = i % 4;
          tags.push({
            handle: userItem.username,
            id: i + 1,
            color: this.colors[index],
            title: userItem.username,
            type: userItem.type,
          });
        }

        this.tagsAllByUser = _.uniqBy(tags, 'handle');
        this.onTagsAllChanged.next(_.uniqBy(tags, 'handle'));

        // apply the tags to the tasks
        const tasks = result[3];
        if (!!tasks && tasks.length > 0) {
          const updatedTasks = tasks.map((item) => {
            // more importantly, to apply UI elements like tags
            const taskItem = new Task(item);
            const foundTags = tags.find((tagItem) => {
              return taskItem.property && tagItem.handle == taskItem.property.username;
            });

            if (!!foundTags) {
              taskItem.tags = [foundTags];
            }
            return taskItem;
          });

          this.figmasAll = updatedTasks;
        } else {
          this.figmasAll = [];
        }
        this.onFigmasListChanged.next(this.figmasAll);
      } else {
        this.onFigmasListChanged.next([]);
      }
    });
  }

  getAllFilters(): Promise<any> {
    return new Promise((resolve, reject) => {
      this._httpClient.get('api/task-filters').subscribe((response: any) => {
        this.filtersAll = response;
        this.onFiltersAllChanged.next(this.filtersAll);
        resolve(this.filtersAll);
      }, reject);
    });
  }

  getAllTags(): Promise<any> {
    return new Promise((resolve, reject) => {
      this._httpClient.get('api/task-tags').subscribe((response: any) => {
        this.tagsAll = response;
        this.onTagsAllChanged.next(this.tagsAll);
        resolve(this.tagsAll);
      }, reject);
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

  getAllDataTasks(body: any): Promise<Task[]> {
    var year = '';
    var month = '';

    if (!!!body.year || !!!body.month) {
      const today = new Date();
      year = moment(today).format('YYYY');
      month = moment(today).format('MM');
    } else {
      year = body.year;
      month = body.month;
    }

    let filters: any = {};
    filters.year = year;
    filters.month = month;
    if (!!body.propertyId) {
      filters.property = body.propertyId;
    }
    return new Promise((resolve, reject) => {
      this._httpClient
        .post(
          `${this.basePathApi}${Configs.TaskSearch}`,
          { filters: filters },
          {
            headers: this.generateHttpHeaders(),
          }
        )
        .subscribe((result: any) => {
          this.figmasAll = result.tasks.map((item) => {
            return new Task(item);
          });
          if (!!this.figmasAll && this.figmasAll.length > 0) {
            this.onFigmasListChanged.next(this.figmasAll);
          } else {
            this.onFigmasListChanged.next([]);
          }

          resolve(this.figmasAll);
        }, reject);
    });
  }

  addTask(task): any {
    const taskTimeStart = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
    const taskTimeEnd = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
    const taskDateStart = moment(task.dateStart).format('YYYY-MM-DD HH:mm:ss');
    const taskDateEnd = moment(task.dateEnd).format('YYYY-MM-DD HH:mm:ss');

    var timeStart = '';
    if (!!taskTimeStart && !!taskDateStart) {
      timeStart = `${taskDateStart.split(' ')[0]}T${task.timeStartTime}:00.000Z`;
    }

    var timeEnd = '';
    if (!!taskTimeEnd && !!taskDateEnd) {
      timeEnd = `${taskDateEnd.split(' ')[0]}T${task.timeEndTime}:00.000Z`;
    }

    const offset = moment().utcOffset();
    const timeStartUTC = moment(timeStart, 'YYYY-MM-DD HH:mm:sssZ').subtract(offset, 'minutes');
    const timeEndUTC = moment(timeEnd, 'YYYY-MM-DD HH:mm:sssZ').subtract(offset, 'minutes');
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;

    const newTask = {
      title: task.title,
      description: task.description,
      dateStart: timeStartUTC,
      dateEnd: timeEndUTC,
      recurrence: task.recurrence,
      countEntries: `${task.count}`,
      timezone: tz,
      property: task.property,
      status: task.status,
      isImageRequired: task.isImageRequired,
    };

    return new Promise((resolve, reject) => {
      this._httpClient
        .post(
          `${this.basePathApi}${Configs.Task}`,
          { task: newTask },
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

  updateTask(task): any {
    const taskTimeStart = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
    const taskTimeEnd = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
    const taskDateStart = moment(task.dateStart).format('YYYY-MM-DD HH:mm:ss');
    const taskDateEnd = moment(task.dateEnd).format('YYYY-MM-DD HH:mm:ss');

    var timeStart = '';
    if (!!taskTimeStart && !!taskDateStart) {
      timeStart = `${taskDateStart.split(' ')[0]}T${task.timeStartTime}:00.000Z`;
    }

    var timeEnd = '';
    if (!!taskTimeEnd && !!taskDateEnd) {
      timeEnd = `${taskDateEnd.split(' ')[0]}T${task.timeEndTime}:00.000Z`;
    }

    const offset = moment().utcOffset();
    const timeStartUTC = moment(timeStart, 'YYYY-MM-DD HH:mm:sssZ').subtract(offset, 'minutes');
    const timeEndUTC = moment(timeEnd, 'YYYY-MM-DD HH:mm:sssZ').subtract(offset, 'minutes');
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;

    const newTask = {
      _id: task._id,
      title: task.title,
      description: task.description,
      dateStart: timeStartUTC,
      dateEnd: timeEndUTC,
      recurrence: task.recurrence,
      countEntries: `${task.count}`,
      timezone: tz,
      property: task.property,
      status: task.status,
      batchId: task.batchId,
    };

    return new Promise((resolve, reject) => {
      this._httpClient
        .put(
          `${this.basePathApi}${Configs.Task}`,
          { task: newTask },
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

  deleteTask(task): any {
    return new Promise((resolve, reject) => {
      this._httpClient
        .delete(`${this.basePathApi}${Configs.Task}${task._id}`, {
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

  getAllEmployees(): Promise<any> {
    return new Promise((resolve, reject) => {
      this._httpClient
        .get(`${this.basePathApi}${Configs.Employee}`, {
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

  getAllUsers(): Promise<any> {
    return new Promise((resolve, reject) => {
      this._httpClient
        .get(`${this.basePathApi}${Configs.User}`, {
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

  setFilterDateRangeStart(value: Date) {
    this.filterDateRangeStart = value;
  }

  setFilterDateRangeEnd(value: Date) {
    this.filterDateRangeEnd = value;
  }

  setFilterLocation(value: string) {
    this.filterLocation = value;
  }

  clearCurrentFilters() {
    this.filterDateRangeStart = new Date();
    this.filterDateRangeEnd = new Date();
    this.filterLocation = null;
  }

  getCurrentFilters() {
    return {
      dateRangeStart: this.filterDateRangeStart,
      dateRangeEnd: this.filterDateRangeEnd,
      location: this.filterLocation,
    };
  }

  private generateHttpHeaders(): HttpHeaders {
    const loggedInUserToken = localStorage.getItem('loggedInUserToken');

    return new HttpHeaders({
      Authorization: loggedInUserToken,
    });
  }
}
