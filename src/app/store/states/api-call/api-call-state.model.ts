export class ApiCallStateModel {
    public updateUser: CallState;
    public changePassword: CallState;
}
  
export class CallState {
    error?: string = '';
    loading?: boolean = false;
    success?: boolean = false;
    response?: any = {};
}

// export const enum LoadingState {
//     INIT = 'INIT',
//     LOADING = 'LOADING',
//     LOADED = 'LOADED',
// }
// export interface ErrorState {
//     errorMsg: string;
// }