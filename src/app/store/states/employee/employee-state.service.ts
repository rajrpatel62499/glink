import { tap, map } from 'rxjs/operators';
import { from, Observable } from 'rxjs';
import { ApiUrls } from '../../ApiUrls';
import { ApiService } from './../../services/api.service';
import { Injectable } from '@angular/core';
import { UtilService } from 'app/store/services/util.service';
import { Select, Store } from '@ngxs/store';
import { FetchAllEmployees } from './employee.actions';
import { EmployeeEntity } from './employee-state.model';

@Injectable({
  providedIn: 'root',
})
export class EmployeeStateService {


  constructor(private api: ApiService, private util: UtilService, private store: Store) {}

  ngOnInit() {}

  getAllEmployees(paramsObj?) {
    const url = ApiUrls.employee.getAllEmployees;
    const req = this.api.get({ url, paramsObj, callState: FetchAllEmployees.type }).catch(this.errorHandler);

    const mapData = (res: { employees: any[]}) => {
      const employeeList = res.employees.map((location) => {
        return new EmployeeEntity(location);
      });
      return employeeList;
    }

    return from(req).pipe(map(mapData));

  }


  private errorHandler(error) {
    console.log(error);
  }

}
