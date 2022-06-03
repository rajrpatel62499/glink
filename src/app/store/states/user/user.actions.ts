import { Action } from '@ngxs/store';
import { User } from './user.model';

export enum ActionTypes {
  AuthenticateUser = '[Route AuthenticateUser] action',
  GetUserById = '[Login GetUserById] action',
}

export class AuthenticateUser {
  public static readonly type = ActionTypes.AuthenticateUser;
  constructor(public payload: any, public error: Error) {} // change to token and id
}

export class GetUserById {
  public static readonly type = ActionTypes.GetUserById;
  constructor(public user: User, public error: Error) {}
}

export const IMPORT_USER_ACTIONS = [AuthenticateUser, GetUserById];
