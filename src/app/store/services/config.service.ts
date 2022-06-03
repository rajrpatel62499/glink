import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Configs } from 'core/constants';
import { BehaviorSubject } from 'rxjs';
import { Flag } from '../models/flag.model';

interface Config {
  baseURL: string;
  socketURL: string;
  server: string;
  company: string;
  theme: string;
}

@Injectable({
  providedIn: 'root',
})
export class ConfigService {
  config: Config = {} as Config;

  get basePathApi() {
    return `${this.config.baseURL}${Configs.Api}`;
  }

  constructor(private http: HttpClient) {}

  loadConfig() {
    return this.http
      .get<Config>('./assets/config.json')
      .toPromise()
      .then((config: Config) => {
        this.config = config;
      });
  }
}
