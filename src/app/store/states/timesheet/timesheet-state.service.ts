
import { ApiUrls } from '../../ApiUrls';
import { ApiService } from './../../services/api.service';
import { Injectable } from '@angular/core';
import { UtilService } from 'app/store/services/util.service';
import { Store } from '@ngxs/store';
import { AddMultiplePackages } from './timesheet.actions';
import { TimeSheetEntity } from './timesheet-state.model';

@Injectable({
  providedIn: 'root',
})
export class TimeSheetStateService {

  
  constructor(private api: ApiService, private util: UtilService, private store: Store) {}

  ngOnInit() {}

  addMultiplePackages(timesheets: TimeSheetEntity[]) {
    const url = ApiUrls.timesheet.addPackages;
    const req = this.api.post({ url, payload: { schedules: timesheets } , progress: true, callState: AddMultiplePackages.type }).catch(this.errorHandler);

    return req;
  }


  private errorHandler(error) {
    console.log(error);
  }

}
