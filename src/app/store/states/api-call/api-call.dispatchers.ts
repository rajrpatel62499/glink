import { ApiCallLoading, ApiCallStateChange, ApiCallLoaded, ApiCallError, ResetAllLoaders, ResetCallState } from './api-call.actions';
import { Dispatch } from '@ngxs-labs/dispatch-decorator';
import { ApiCallStateModel } from './api-call-state.model';


export class ApiCallDispatchers {

  @Dispatch()
  public static apiCallStateChange(payload: Partial<ApiCallStateModel>) {
    return [new ApiCallStateChange(payload)];
  }

  @Dispatch()
  public static apiCallLoading(payload: Partial<ApiCallStateModel>) {
    return [new ApiCallLoading(payload)];
  }

  @Dispatch()
  public static apiCallLoaded(payload: Partial<ApiCallStateModel>) {
    return [new ApiCallLoaded(payload)];
  }

  @Dispatch()
  public static apiCallError(payload: Partial<ApiCallStateModel>) {
    return [new ApiCallError(payload)];
  }

  
  @Dispatch()
  public static resetAllLoaders() {
    return [new ResetAllLoaders()];
  }

  @Dispatch() 
  public static resetState(payload) {
    return [ new ResetCallState(payload)];
  }

}
