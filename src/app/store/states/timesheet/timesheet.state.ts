import { TimeSheetStateService } from './timesheet-state.service';
import { Injectable } from '@angular/core';
import { State, Action, StateContext } from '@ngxs/store';
import { TimesheetStateModel as TimeSheetStateModel } from './timesheet-state.model';
import { AddMultiplePackages } from './timesheet.actions';


const defaults = new TimeSheetStateModel(); 

@State<TimeSheetStateModel>({
  name: 'timesheet',
  defaults
})
@Injectable()
export class TimeSheetState {

  constructor(private _timesheet: TimeSheetStateService) {

  }

  @Action(AddMultiplePackages)
  addMultiplePackages({ getState, setState }: StateContext<TimeSheetStateModel>, { payload }: AddMultiplePackages) {
    const state = getState();
    // api call to add this schedules. 
    try {
      const res = this._timesheet.addMultiplePackages(payload).then();
      console.log("BINGO", { res, payload});

    } catch (error) {
      
    }
  }

}
