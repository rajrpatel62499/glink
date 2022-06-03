import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { ConfigService } from 'app/store/services/config.service';
import { Configs } from 'core/constants';
import * as _ from 'lodash';
import * as moment from 'moment';
import { BehaviorSubject, Observable } from 'rxjs';
import { Employee } from '../employee/models/employee.model';
import { ALocation } from '../location/location.model';
import { Schedule } from '../schedule/schedule.model';
import { User } from '../user/user.model';

@Injectable()
export class ClientService implements Resolve<any> {
  boards: any[];
  routeParams: any;
  board: any;

  onUsersChanged: BehaviorSubject<any>;
  onBoardChanged: BehaviorSubject<any>;

  basePathApi = '';
  path = '';
  onBannersChanged: BehaviorSubject<any>;
  onBannerChanged: BehaviorSubject<any>;

  // filter items
  filterDateRangeStart = new Date();
  filterDateRangeEnd = new Date();
  filterLocation = null;
  schedulesAll: Schedule[] = [];
  tagsAll: any[] = [];

  constructor(private _httpClient: HttpClient, _configService: ConfigService) {
    this.onUsersChanged = new BehaviorSubject([]);
    this.onBoardChanged = new BehaviorSubject([]);
    this.onBannersChanged = new BehaviorSubject([]);
    this.onBannerChanged = new BehaviorSubject(null);

    this.basePathApi = `${_configService.config.baseURL}${Configs.Api}`;
  }

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<any> | Promise<any> | any {
    const queryParams = route.queryParams;
    this.routeParams = route.params;
    this.path = route.routeConfig.path;

    if (!!queryParams) {
      this.onBannerChanged.next({
        banner: queryParams.banner,
        client: queryParams.client,
        clientId: queryParams.clientId,
        locationId: queryParams.locationId,
      });
    }

    return new Promise((resolve, reject) => {
      Promise.all([this.getBoards(), this.getAllUsers()]).then((result) => {
        const users = result[1];
        resolve();
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
          this.onUsersChanged.next(userList);
          resolve(response);
        }, reject);
    });
  }

  getEmployeesByLocation(locationId): Promise<Employee[]> {
    return new Promise((resolve, reject) => {
      this._httpClient
        .get(`${this.basePathApi}${Configs.ALocation}${locationId}`, {
          headers: this.generateHttpHeaders(),
        })
        .subscribe((result: any) => {
          const location = new ALocation(result.location);
          resolve(location.employees);
        }, reject);
    });
  }

  getEmployeeById(id): Promise<Employee> {
    return new Promise((resolve, reject) => {
      this._httpClient
        .get(`${this.basePathApi}${Configs.Employee}${id}`, {
          headers: this.generateHttpHeaders(),
        })
        .subscribe((result: any) => {
          const employee = new Employee(result.employee);
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

  deleteEmployee(employee): any {
    return new Promise((resolve, reject) => {
      this._httpClient
        .delete(`${this.basePathApi}${Configs.Employee}${employee.id}`, {
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
        .then((response) => {
          resolve(response);
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

  getBoards(): Promise<any> {
    return new Promise((resolve, reject) => {
      this._httpClient.get('api/client-banners').subscribe((response: any) => {
        this.boards = response;
        this.onUsersChanged.next(this.boards);
        resolve(this.boards);
      }, reject);
    });
  }

  getBoard(boardId): Promise<any> {
    return new Promise((resolve, reject) => {
      this._httpClient.get('api/client-banners/' + boardId).subscribe((response: any) => {
        this.board = response;
        this.onBoardChanged.next(this.board);
        resolve(this.board);
      }, reject);
    });
  }

  addCard(listId, newCard): Promise<any> {
    this.board.lists.map((list) => {
      if (list.id === listId) {
        return list.idCards.push(newCard.id);
      }
    });

    this.board.cards.push(newCard);

    return this.updateBoard();
  }

  addList(newList): Promise<any> {
    this.board.lists.push(newList);

    return this.updateBoard();
  }

  removeList(listId): Promise<any> {
    const list = this.board.lists.find((_list) => {
      return _list.id === listId;
    });

    for (const cardId of list.idCards) {
      this.removeCard(cardId);
    }

    const index = this.board.lists.indexOf(list);

    this.board.lists.splice(index, 1);

    return this.updateBoard();
  }

  removeCard(cardId, listId?): void {
    const card = this.board.cards.find((_card) => {
      return _card.id === cardId;
    });

    if (listId) {
      const list = this.board.lists.find((_list) => {
        return listId === _list.id;
      });
      list.idCards.splice(list.idCards.indexOf(cardId), 1);
    }

    this.board.cards.splice(this.board.cards.indexOf(card), 1);

    this.updateBoard();
  }

  updateBoard(): Promise<any> {
    return new Promise((resolve, reject) => {
      this._httpClient
        .post('api/client-banners/' + this.board.id, this.board)
        .subscribe((response) => {
          this.onBoardChanged.next(this.board);
          resolve(this.board);
        }, reject);
    });
  }

  updateCard(newCard): void {
    this.board.cards.map((_card) => {
      if (_card.id === newCard.id) {
        return newCard;
      }
    });

    this.updateBoard();
  }

  createNewBoard(board): Promise<any> {
    return new Promise((resolve, reject) => {
      this._httpClient.post('api/client-banners/' + board.id, board).subscribe((response) => {
        resolve(board);
      }, reject);
    });
  }

  getCurrentFilters() {
    return {
      dateRangeStart: this.filterDateRangeStart,
      dateRangeEnd: this.filterDateRangeEnd,
      location: this.filterLocation,
    };
  }

  getAllDataSchedules(): Promise<Schedule[]> {
    const dateRangeStartString = moment(this.filterDateRangeStart)
      .startOf('day')
      .add(12, 'hours')
      .format('YYYY-MM-DDTHH:mm:ss.ssZ');
    const dateRangeEndString = moment(this.filterDateRangeEnd)
      .startOf('day')
      .add(12, 'hours')
      .format('YYYY-MM-DDTHH:mm:ss.ssZ');

    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;

    const filters = {
      dateRangeStart: dateRangeStartString,
      dateRangeEnd: dateRangeEndString,
      location: this.filterLocation,
      timezone: tz,
    };

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
          this.schedulesAll = result.schedules.map((item) => {
            // more importantly, to apply UI elements like tags
            return new Schedule(item);
          });

          if (!!this.schedulesAll && this.schedulesAll.length > 0) {
            const schedules = this.schedulesAll;
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

              this.schedulesAll = updatedSchedules;
            } else {
              this.schedulesAll = [];
            }

            resolve(this.schedulesAll);
          } else {
            resolve([]);
          }
        }, reject);
    });
  }

  searchTextChange2(searchText: string) {}

  containsDeepSearchMatch2(object: any, searchText: string): boolean {
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

  getScheduleById(id): Promise<Schedule> {
    return new Promise((resolve, reject) => {
      this._httpClient
        .get(`${this.basePathApi}${Configs.Timesheet}${Configs.Schedule}${id}`, {
          headers: this.generateHttpHeaders(),
        })
        .subscribe((result: any) => {
          const schedule = new Schedule(result.schedule);
          resolve(schedule);
        }, reject);
    });
  }

  updateBannersAll(payload: any): Promise<Schedule> {
    return new Promise((resolve, reject) => {
      this._httpClient
        .put(
          `${this.basePathApi}${Configs.User}${Configs.BannerAll}`,
          { oldBanner: payload.oldBanner, newBanner: payload.newBanner },
          {
            headers: this.generateHttpHeaders(),
          }
        )
        .subscribe((result: any) => {
          this.getAllUsers();
          resolve(result);
        }, reject);
    });
  }
}

@Injectable()
export class BoardResolve implements Resolve<any> {
  constructor(private _scrumboardService: ClientService) {}
  resolve(route: ActivatedRouteSnapshot): Promise<any> {
    return this._scrumboardService.getBoard(route.paramMap.get('bannerId'));
  }
}
