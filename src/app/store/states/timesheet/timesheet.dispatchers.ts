import { TimeSheetEntity } from './timesheet-state.model';
import { AddMultiplePackages } from './timesheet.actions';
import { Dispatch } from "@ngxs-labs/dispatch-decorator";

export class TimeSheetDispatchers {
    @Dispatch()
    public static AddMultiplePackages(payload:  TimeSheetEntity[]) {
        return [ new AddMultiplePackages(payload) ];
    }

}