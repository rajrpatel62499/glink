import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { ConfigService } from 'app/store/services/config.service';
import { Configs } from 'core/constants';
import * as _ from 'lodash';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { User } from '../user/user.model';
import { Room } from './room.model';

@Injectable()
export class ChatService implements Resolve<any> {
  basePathApi = '';
  contacts: any[] = [];
  rooms: Room[] = [];
  user: User;
  onRoomSelected: BehaviorSubject<Room>;
  onContactSelected: BehaviorSubject<any>;
  onRoomsUpdated: Subject<Room[]>;
  onChatsUpdated: Subject<any>;
  onUserUpdated: Subject<any>;
  onLeftSidenavViewChanged: Subject<any>;
  onRightSidenavViewChanged: Subject<any>;

  constructor(private _httpClient: HttpClient, _configService: ConfigService) {
    this.onRoomSelected = new BehaviorSubject(null);
    this.onContactSelected = new BehaviorSubject(null);
    this.onRoomsUpdated = new Subject();
    this.onChatsUpdated = new Subject();
    this.onUserUpdated = new Subject();
    this.onLeftSidenavViewChanged = new Subject();
    this.onRightSidenavViewChanged = new Subject();

    this.basePathApi = `${_configService.config.baseURL}${Configs.Api}`;
  }

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<any> | Promise<any> | any {
    return new Promise((resolve, reject) => {
      Promise.all([this.getRooms(), this.getUsers(), this.getUser()]).then(
        ([rooms, users, user]) => {
          this.user = new User(user.user);

          if (!!rooms) {
            const responseUsers = rooms.rooms.map((item) => {
              return new Room(item);
            });
            this.rooms = responseUsers;
          }

          if (!!users) {
            const responseUsers = users.users.map((item) => {
              return new User(item);
            });
            this.contacts = responseUsers.filter((item) => {
              return true;
            });
          }

          resolve();
        },
        reject
      );
    });
  }

  async getRoomByContact(contact: User): Promise<any> {
    await this.getRooms().then((roomResponse) => {
      if (!!roomResponse && !!roomResponse.rooms) {
        const loggedInUserId = localStorage.getItem('loggedInUserId');

        const contactsToFind = [contact._id, loggedInUserId];

        const roomItems = roomResponse.rooms as Room[];
        if (!!roomItems && roomItems.length > 0) {
          roomItems.forEach((r) => {
            const participantIds = r.participants.map((r) => {
              return r._id;
            });
            if (_.difference(contactsToFind, participantIds).length === 0) {
              // room not found, create one
              return new Promise((resolve, reject) => {
                this._httpClient
                  .get(`${this.basePathApi}${Configs.Room}${r._id}`, {
                    headers: this.generateHttpHeaders(),
                  })
                  .toPromise()
                  .then((response) => {
                    const anyRoomResponse = response as any;
                    const objRoom = new Room(anyRoomResponse.room);
                    this.onRoomSelected.next(objRoom);

                    this.rooms.forEach((r) => {
                      if (r._id == objRoom._id) {
                        r.hasUnread = false;
                      }
                    });
                    this.onRoomsUpdated.next(this.rooms);

                    resolve(response);
                  })
                  .catch((error) => {
                    reject(error);
                  });
              });
            } else {
              const room = { _id: null, chats: [], contact: contact } as Room;
              this.onRoomSelected.next(room);

              this.rooms.forEach((r) => {
                if (r._id == room._id) {
                  r.hasUnread = false;
                }
              });
              this.onRoomsUpdated.next(this.rooms);
            }
          });
        } else {
          const room = { _id: null, chats: [], contact: contact } as Room;
          this.onRoomSelected.next(room);

          this.rooms.forEach((r) => {
            if (r._id == room._id) {
              r.hasUnread = false;
            }
          });
          this.onRoomsUpdated.next(this.rooms);
        }
      } else {
        // nothing found, just select the room locally
        const room = { _id: null, chats: [], contact: contact } as Room;
        this.onRoomSelected.next(room);

        this.rooms.forEach((r) => {
          if (r._id == room._id) {
            r.hasUnread = false;
          }
        });
        this.onRoomsUpdated.next(this.rooms);
      }
    });
  }

  async getRoomById(room: Room): Promise<any> {
    return new Promise((resolve, reject) => {
      this._httpClient
        .get(`${this.basePathApi}${Configs.Room}${room._id}`, {
          headers: this.generateHttpHeaders(),
        })

        .toPromise()
        .then((response) => {
          const anyRoomResponse = response as any;
          const objRoom = new Room(anyRoomResponse.room);
          this.onRoomSelected.next(objRoom);

          this.rooms.forEach((r) => {
            if (r._id == objRoom._id) {
              r.hasUnread = false;
            }
          });
          this.onRoomsUpdated.next(this.rooms);

          resolve(response);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  createNewRoom(room: Room): Promise<any> {
    return new Promise((resolve, reject) => {
      this._httpClient
        .post(
          `${this.basePathApi}${Configs.Room}`,
          { room: room },
          {
            headers: this.generateHttpHeaders(),
          }
        )
        .toPromise()
        .then((response) => {
          const anyRoomResponse = response as any;
          const objRoom = new Room(anyRoomResponse.room);
          this.onRoomSelected.next(objRoom);

          this.getRooms().then((rooms) => {
            if (!!rooms) {
              const responseUsers = rooms.rooms.map((item) => {
                return new Room(item);
              });
              this.rooms = responseUsers;
            }

            this.onRoomsUpdated.next(this.rooms);
          });
          resolve(response);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  updateRoomById(room: Room): any {
    if (!room) {
      return;
    }

    return new Promise((resolve, reject) => {
      this._httpClient
        .put(
          `${this.basePathApi}${Configs.Room}${room._id}/complete`,
          { room },
          {
            headers: this.generateHttpHeaders(),
          }
        )
        .toPromise()
        .then((response) => {
          this.onRoomSelected.next(null);
          this.rooms = this.rooms.filter((r) => {
            return r._id != room._id;
          });
          this.onRoomsUpdated.next(this.rooms);
          resolve(response);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  selectContact(contact): void {
    this.onContactSelected.next(contact);
  }

  setUserStatus(status): void {
    this.user.status = status;
  }

  updateUserData(userData): void {
    this._httpClient.post('api/chat-user/' + this.user._id, userData).subscribe((response: any) => {
      this.user = userData;
    });
  }

  updateDialog(chatId, dialog): Promise<any> {
    return new Promise((resolve, reject) => {
      const newData = {
        id: chatId,
        dialog: dialog,
      };

      this._httpClient.post('api/chat-chats/' + chatId, newData).subscribe((updatedChat) => {
        resolve(updatedChat);
      }, reject);
    });
  }

  getUsers(): Promise<any> {
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

  getUser(): Promise<any> {
    const loggedInUserId = localStorage.getItem('loggedInUserId');
    return new Promise((resolve, reject) => {
      this._httpClient
        .get(`${this.basePathApi}${Configs.User}${loggedInUserId}`, {
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

  getRooms(): Promise<any> {
    return new Promise((resolve, reject) => {
      this._httpClient
        .get(`${this.basePathApi}${Configs.Room}`, {
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
