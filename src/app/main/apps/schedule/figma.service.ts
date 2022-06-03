import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { ConfigService } from 'app/store/services/config.service';
import { Configs } from 'core/constants';
import * as _ from 'lodash';
import * as moment from 'moment';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { ALocation } from '../location/location.model';
import { Schedule } from './schedule.model';

@Injectable()
export class ScheduleService implements Resolve<any> {
  onContactSelected: BehaviorSubject<any>;
  onUserUpdated: Subject<any>;
  onLeftSidenavViewChanged: Subject<any>;
  onRightSidenavViewChanged: Subject<any>;

  // user-service
  basePathApi = '';
  path = '';
  routeParams: any = null;
  figmasAll: Schedule[];
  filtersAll: any[];
  tagsAll: any[] = [];
  figma: Schedule;
  locationId: string;

  // schedule service start
  filterDateRangeStart = new Date();
  filterDateRangeEnd = new Date();
  filterLocation = null;
  currentSearchText: string;
  currentTagHandle: string;
  onFiltersAllChanged: BehaviorSubject<any>;
  onTagsAllChanged: BehaviorSubject<any>;
  onDateRangeEndChanged: Subject<any>;
  // schedule service end

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
    this.setSelected(null);

    if (this.path == 'all') {
      this.locationId = null;
      return new Promise((resolve, reject) => {
        Promise.all([this.getAllDataSchedulesByLocationId()]).then(([schedules]) => {
          this.onParamChanged.next({ title: 'COMMON.SCHEDULES' });
          resolve();
        }, reject);
      });
    } else if (this.path == 'location') {
      this.locationId = queryParams.locationId;
      return new Promise((resolve, reject) => {
        Promise.all([this.getAllDataSchedulesByLocationId()]).then(([users]) => {
          this.onParamChanged.next(queryParams);
          resolve();
        }, reject);
      });
    }
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

  private getFilteredSchedules(): Schedule[] {
    var filteredSchedules = this.figmasAll;

    if (!!!filteredSchedules || (!!filteredSchedules && filteredSchedules.length == 0)) {
      return [];
    }

    if (!!this.currentTagHandle) {
      filteredSchedules = filteredSchedules.filter((item) => {
        return item.tags.find((tag) => {
          return tag.handle === this.currentTagHandle;
        });
      });
    }

    if (!!this.currentSearchText) {
      filteredSchedules = filteredSchedules.filter((item) => {
        return this.containsDeepSearchMatch(item, this.currentSearchText);
      });
    }

    return filteredSchedules;
  }

  searchTextChange(searchText: string) {
    this.currentSearchText = searchText;
    this.onFigmasListChanged.next(this.getFilteredSchedules());
  }

  containsDeepSearchMatch(object: any, searchText: string): boolean {
    let isMatched = false;

    _.cloneDeepWith(object, (v, k) => {
      if (!!isMatched) {
        return;
      }

      const value = !!v && v.toString().toLowerCase();
      if (!!value && value.includes(searchText.toLowerCase())) {
        isMatched = true;
      }
    });
    return isMatched;
  }

  getAllFilters(): Promise<any> {
    return new Promise((resolve, reject) => {
      this._httpClient.get('api/schedule-filters').subscribe((response: any) => {
        this.filtersAll = response;
        this.onFiltersAllChanged.next(this.filtersAll);
        resolve(this.filtersAll);
      }, reject);
    });
  }

  getAllTags(): Promise<any> {
    return new Promise((resolve, reject) => {
      this._httpClient.get('api/schedule-tags').subscribe((response: any) => {
        this.onTagsAllChanged.next(response);
        resolve(response);
      }, reject);
    });
  }

  private setCurrentSchedule(id): void {
    const foundSchedule = this.figmasAll.find((item) => {
      return item._id === id;
    });

    if (!foundSchedule) {
      return;
    }

    this.onCurrentFigmaChanged.next([foundSchedule, 'edit']);
  }

  unsetCurrentSchedule(): void {
    this.onCurrentFigmaChanged.next([null, null]);
  }
  getAllDataSchedulesByLocationId(): Promise<Schedule[]> {
    // TODO: KEN
    // the problem is that in the backend, a schedule does not have a property, but a location
    const dateRangeStartString = moment(this.filterDateRangeStart)
      .startOf('day')
      .add(12, 'hours')
      .format('YYYY-MM-DDTHH:mm:ss.ssZ');
    const dateRangeEndString = moment(this.filterDateRangeEnd)
      .startOf('day')
      .add(12, 'hours')
      .format('YYYY-MM-DDTHH:mm:ss.ssZ');

    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;

    let filters: any = {};

    filters.dateRangeStart = dateRangeStartString;
    filters.dateRangeEnd = dateRangeEndString;
    filters.timezone = tz;

    if (!!this.locationId) {
      filters.location = this.locationId;
    }

    return new Promise((resolve, reject) => {
      this._httpClient
        .post(
          `${this.basePathApi}${Configs.Timesheet}${Configs.ScheduleSearch}`,
          { filters: filters },
          {
            headers: this.generateHttpHeaders(),
          }
        )
        .subscribe((result: any) => {
          this.figmasAll = result.schedules.map((item) => {
            // more importantly, to apply UI elements like tags
            return new Schedule(item);
          });

          if (!!this.figmasAll && this.figmasAll.length > 0) {
            const schedules = this.figmasAll;
            if (!!schedules && schedules.length > 0) {
              const updatedSchedules = schedules.map((item) => {
                // more importantly, to apply UI elements like tags
                const schedItem = new Schedule(item);
                const foundTags = this.tagsAll.find((tagItem) => {
                  return schedItem.location && tagItem.handle == schedItem.location._id;
                });

                if (!!foundTags) {
                  schedItem.tags = [foundTags];
                }
                return schedItem;
              });

              this.figmasAll = updatedSchedules;
            } else {
              this.figmasAll = [];
            }

            this.onFigmasListChanged.next(this.figmasAll);
          } else {
            this.onFigmasListChanged.next([]);
          }
          resolve(this.figmasAll);
        }, reject);
    });
  }

  addSchedule(schedule): any {
    const scheduleTimeStart = moment(schedule.dateRangeStart).format('YYYY-MM-DD HH:mm:ss');
    const scheduleTimeEnd = moment(schedule.dateRangeEnd).format('YYYY-MM-DD HH:mm:ss');
    var timeStart = '';
    if (!!scheduleTimeStart && !!schedule.timeStartTime) {
      timeStart = `${scheduleTimeStart.split(' ')[0]}T${schedule.timeStartTime}:00.000Z`;
    }

    var timeEnd = '';
    if (!!scheduleTimeEnd && !!schedule.timeEndTime) {
      timeEnd = `${scheduleTimeEnd.split(' ')[0]}T${schedule.timeEndTime}:00.000Z`;
    }
    const offset = moment().utcOffset();
    const timeStartUTC = moment(timeStart, 'YYYY-MM-DD HH:mm:sssZ').subtract(offset, 'minutes');
    const timeEndUTC = moment(timeEnd, 'YYYY-MM-DD HH:mm:sssZ').subtract(offset, 'minutes');
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;

    const newSchedule = [
      {
        employee: schedule.employee,
        location: schedule.location,
        status: schedule.status,
        timeStart: timeStartUTC,
        timeEnd: timeEndUTC,
        timezone: tz,
      },
    ];

    return new Promise((resolve, reject) => {
      this._httpClient
        .post(
          `${this.basePathApi}${Configs.Timesheet}${Configs.Schedule}`,
          { schedules: newSchedule },
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

  updateSchedule(schedule): any {
    var timeStart = '';

    if (!!schedule.timeStartDate && !!schedule.timeStartTime) {
      const scheduleTimeStart = schedule.timeStartDate.format('YYYY-MM-DD');
      timeStart = `${scheduleTimeStart}T${schedule.timeStartTime}:00.000Z`;
    }

    var timeEnd = '';
    if (!!schedule.timeEndDate && !!schedule.timeEndTime) {
      const scheduleTimeEnd = schedule.timeEndDate.format('YYYY-MM-DD');

      timeEnd = `${scheduleTimeEnd}T${schedule.timeEndTime}:00.000Z`;
    }

    const offset = moment().utcOffset();
    const timeStartUTC = moment(timeStart, 'YYYY-MM-DD HH:mm:sssZ').subtract(offset, 'minutes');
    const timeEndUTC = moment(timeEnd, 'YYYY-MM-DD HH:mm:sssZ').subtract(offset, 'minutes');
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;

    // punchIn / punchOut
    var punchIn = '';
    if (typeof schedule.punchInDate === 'string') {
      schedule.punchInDate = moment(schedule.punchInDate);
    }

    if (typeof schedule.punchOutDate === 'string') {
      schedule.punchOutDate = moment(schedule.punchOutDate);
    }

    if (
      moment(schedule.punchInDate, moment.ISO_8601, true).isValid() &&
      !!schedule.punchInDate &&
      !!schedule.punchInTime
    ) {
      const schedulepunchIn = schedule.punchInDate.format('YYYY-MM-DD');
      punchIn = `${schedulepunchIn}T${schedule.punchInTime}:00.000Z`;
    }

    var punchOut = '';
    if (
      moment(schedule.punchOutDate, moment.ISO_8601, true).isValid() &&
      !!schedule.punchOutDate &&
      !!schedule.punchOutTime
    ) {
      const schedulepunchOut = schedule.punchOutDate.format('YYYY-MM-DD');
      punchOut = `${schedulepunchOut}T${schedule.punchOutTime}:00.000Z`;
    }

    const punchInUTC = moment(punchIn, 'YYYY-MM-DD HH:mm:sssZ').subtract(offset, 'minutes');
    const punchOutUTC = moment(punchOut, 'YYYY-MM-DD HH:mm:sssZ').subtract(offset, 'minutes');

    const updatedSchedule = [
      {
        _id: schedule.id,
        employee: schedule.employee,
        location: schedule.location,
        punchInStatus: schedule.punchInStatus,
        punchIn: punchInUTC,
        punchOutStatus: schedule.punchOutStatus,
        punchOut: punchOutUTC,
        status: this.getRawStatusType(schedule.status),
        timeStart: timeStartUTC,
        timeEnd: timeEndUTC,
        timezone: tz,
      },
    ];

    return new Promise((resolve, reject) => {
      this._httpClient
        .put(
          `${this.basePathApi}${Configs.Timesheet}${Configs.Schedule}`,
          { schedules: updatedSchedule },
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

  deleteSchedule(schedule): any {
    return new Promise((resolve, reject) => {
      this._httpClient
        .delete(`${this.basePathApi}${Configs.Timesheet}${Configs.Schedule}${schedule.id}`, {
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

  getAllLocations(): Promise<any> {
    return new Promise((resolve, reject) => {
      this._httpClient
        .get(`${this.basePathApi}${Configs.ALocation}`, {
          headers: this.generateHttpHeaders(),
        })
        .toPromise()
        .then((response: any) => {
          const locations = response.locations.map((item) => {
            return new ALocation(item);
          });
          this.onLocationsChanged.next(locations);
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

  generateSpreadsheet(body): Promise<string> {
    if (!body || !body.dateRangeEnd) {
      return Promise.resolve('');
    }

    const dateRangeEnd = moment(body.dateRangeEnd).startOf('day');
    const dateRangeEndString = dateRangeEnd.format('YYYY-MM-DDTHH:mm:ss.ssZ');
    const dayOfWeek = dateRangeEnd.isoWeekday();

    if (dayOfWeek != 6) {
      return Promise.resolve('');
    }

    const filters = {
      dateRangeEnd: dateRangeEndString,
    };

    return new Promise((resolve, reject) => {
      this._httpClient
        .post(
          `${this.basePathApi}${Configs.DownloadSpreadsheet}`,
          { filters: filters },
          {
            headers: this.generateHttpHeaders(),
          }
        )
        .subscribe((result: any) => {
          if (!result || !result.s3Output) {
            return Promise.resolve('');
          }

          resolve(result.s3Output);
        }, reject);
    });
  }

  getRawStatusType(translatableType: String) {
    if (translatableType === 'SCHEDULE.REGULAR') {
      return 'REGULAR';
    } else if (translatableType === 'SCHEDULE.HOLIDAY_WORK') {
      return 'HOLIDAY-WORK';
    } else if (translatableType === 'SCHEDULE.HOLIDAY_OFF') {
      return 'HOLIDAY-OFF';
    } else if (translatableType === 'SCHEDULE.OFF') {
      return 'OFF';
    } else if (translatableType === 'SCHEDULE.VACATION') {
      return 'VACATION';
    } else if (translatableType === 'SCHEDULE.ABSENT') {
      return 'ABSENT';
    } else if (translatableType === 'SCHEDULE.EXCUSED') {
      return 'EXCUSED';
    } else if (translatableType === 'SCHEDULE.SICK') {
      return 'SICK';
    } else if (translatableType === 'SCHEDULE.PERSONAL') {
      return 'PERSONAL';
    } else {
      return 'UNKNOWN';
    }
  }
}
