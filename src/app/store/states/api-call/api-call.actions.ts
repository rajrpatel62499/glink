import { ApiCallStateModel } from "./api-call-state.model";

export class ApiCallStateChange {
  static readonly type = '[Api Call State] Change';
  constructor(public payload: Partial<ApiCallStateModel>) { }
}

export class ApiCallLoading {
  static readonly type = '[Api Call State] Loading...';
  constructor(public payload: Partial<ApiCallStateModel>) { }
}

export class ApiCallLoaded {
  static readonly type = '[Api Call State] Loaded';
  constructor(public payload: Partial<ApiCallStateModel>) { }
}

export class ApiCallError {
  static readonly type = '[Api Call State] Error';
  constructor(public payload: Partial<ApiCallStateModel>) { }
}
export class ResetAllLoaders {
  static readonly type = '[Api Call State] Reset All Loaders';
  constructor() { }
}

export class ResetCallState {
  static readonly type = '[Api Call State] Reset Perticular State';
  constructor(public payload: string) { }
}