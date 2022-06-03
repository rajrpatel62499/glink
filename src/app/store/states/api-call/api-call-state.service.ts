import { ApiCallState } from './api-call.state';
import { Injectable } from '@angular/core';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { CallState } from './api-call-state.model';
import { ApiCallDispatchers } from './api-call.dispatchers';
import { FetchAllLocations } from '../location/location.actions';
import { AddMultiplePackages } from '../timesheet/timesheet.actions';

@Injectable({providedIn: 'root'})
export class ApiCallStateService {
    
    @SelectSnapshot(ApiCallState.fetchState(FetchAllLocations.type)) fetchAllLocations: CallState;
    @SelectSnapshot(ApiCallState.fetchState(AddMultiplePackages.type)) addMultiplePackages: CallState;
    
    constructor() { }

}