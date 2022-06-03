import { Action, Selector, StateContext, Store } from '@ngxs/store';
import { AuthenticateUser, GetUserById } from './user.actions';

import { Injectable } from '@angular/core';
import { State } from '@ngxs/store';
import { User } from './user.model';

export interface UserStateModel {
  user: User;
  isAuthenticated: boolean;
  error: any;
}

@State<UserStateModel>({
  name: 'User',
  defaults: {
    user: {
      id: '',
      first: '',
      last: '',
      username: '',
      token: '',
      eula: '',
    },
    isAuthenticated: null,
    error: '',
  },
})
@Injectable()
export class UserState {
  constructor(private _store: Store) {}
  @Selector()
  static User(state: UserStateModel): User {
    return state.user;
  }

  @Selector()
  static IsAuthenticated(state: UserStateModel): boolean {
    return state.isAuthenticated;
  }

  @Selector()
  static Error(state: UserStateModel): any {
    return state.error;
  }

  @Action(AuthenticateUser)
  authenticateUser(context: StateContext<UserStateModel>, action: AuthenticateUser) {
    const userInfo = action.payload;
    if (!!userInfo.token && !!userInfo.id) {
      localStorage.setItem('loggedInUserToken', userInfo.token);
      localStorage.setItem('loggedInUserId', userInfo.id);

      context.patchState({
        isAuthenticated: true,
        error: null,
      });
      return;
    }

    context.patchState({
      isAuthenticated: false,
      error: action.error,
    });
  }

  @Action(GetUserById)
  getUser(context: StateContext<UserStateModel>, action: GetUserById) {
    // const userId = action.userId;
    const user = action.user;

    if (!!user) {
      context.patchState({
        user: user,
        isAuthenticated: !!user ? true : false,
      });
      return;
    }
    context.patchState({
      isAuthenticated: false,
      error: action.error,
    });
  }
}
