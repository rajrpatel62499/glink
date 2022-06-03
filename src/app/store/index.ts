import { TimeSheetState } from './states/timesheet/timesheet.state';
import { EmployeeState } from './states/employee/employee.state';
import { ApiCallState } from './states/api-call/api-call.state';
import { LocationState } from './states/location/location.state';
import { UserState } from './states/user/user.state';

export * from './reducers';
export * from './actions';
export * from './effects';


export const AppStates = [
    UserState,
    LocationState,
    EmployeeState,
    TimeSheetState,
    ApiCallState
]