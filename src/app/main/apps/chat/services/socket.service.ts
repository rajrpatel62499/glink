import * as io from 'socket.io-client';

import { ConfigService } from 'app/store/services/config.service';
import { Configs } from 'core/constants';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable()
export class SocketService {
  socketUri = ''; //`${Configs.SocketPath}${Configs.SocketNamespace}`;
  socket: SocketIOClient.Socket;

  constructor(_configService: ConfigService) {
    this.socketUri = `${_configService.config.socketURL}${Configs.SocketNamespace}`;
    // this.socket = io.connect(this.socketUri, {
    //   path: `/${_configService.config.server}/socket.io`,
    // });
    this.socket = io.connect(this.socketUri, {});
  }

  listen(eventname: string): Observable<any> {
    return new Observable((subscriber) => {
      this.socket.on(eventname, (data: any) => {
        subscriber.next(data);
      });
    });
  }

  emit(eventname: string, data: any) {
    this.socket.emit(eventname, data);
  }
}
