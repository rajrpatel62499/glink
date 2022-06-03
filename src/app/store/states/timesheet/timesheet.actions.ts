import { TimesheetStateModel, TimeSheetEntity } from './timesheet-state.model';

export class AddMultiplePackages {
  static readonly type = '[Timesheet] Add Multiple Packages';
  constructor(public payload:  TimeSheetEntity[]) { }
}
