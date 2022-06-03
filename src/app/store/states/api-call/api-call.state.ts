import { Injectable } from '@angular/core';
import { ImmutableContext } from '@ngxs-labs/immer-adapter';
import { State, Action, StateContext, createSelector } from '@ngxs/store';
import { ApiCallStateModel, CallState } from './api-call-state.model';
import { ApiCallStateChange, ApiCallLoading, ApiCallLoaded, ApiCallError, ResetAllLoaders, ResetCallState } from './api-call.actions';


const defaults = new ApiCallStateModel();

@State<ApiCallStateModel>({
  name: 'apiCall',
  defaults,
})
@Injectable()
export class ApiCallState {

    
  public static fetchState(type?: any) {
    return createSelector([ApiCallState], (state) => state[type]);
  }
  
  
  @Action([ ApiCallLoading, ApiCallLoaded, ApiCallError, ApiCallStateChange])
  public ApiCallStateChange(ctx: StateContext<ApiCallStateModel>, { payload }: ApiCallLoading | ApiCallLoaded | ApiCallError | ApiCallStateChange) {
    const state = ctx.getState();
    ctx.patchState({ ...state , ...payload});
  }
  
  
  @Action([ ResetAllLoaders])
  public resetAllLoaders(ctx: StateContext<ApiCallStateModel>, action: ResetAllLoaders) {
    const state = ctx.getState();
    Object.keys(state).forEach(key => {
      state[key].loading = false;
    })
    ctx.setState(state);
  }

  @Action(ResetCallState) 
  @ImmutableContext()
  public resetCallState(ctx: StateContext<ApiCallStateModel>, action: ResetCallState) {
    let state = ctx.getState();
    state[action.payload] = new CallState();
    ctx.patchState(state);
  }

}
