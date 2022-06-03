import { Injectable } from '@angular/core';
import { EntityState, IdStrategy } from '@ngxs-labs/entity-state';
import { State, Action, StateContext } from '@ngxs/store';
import { FetchAllEmployees } from './employee.actions';
import { EmployeeEntity, EmployeeStateModel } from './employee-state.model';
import { EmployeeStateService } from './employee-state.service';


const defaults = new EmployeeStateModel();

@State<EmployeeStateModel>({
  name: 'employee',
  defaults
})
@Injectable()
export class EmployeeState extends EntityState<EmployeeEntity> {

  constructor(private _emp: EmployeeStateService ) {
    super( EmployeeState, '_id', IdStrategy.EntityIdGenerator);
  }

  @Action(FetchAllEmployees)
  async fetchAll(state: StateContext<EmployeeStateModel>, action: FetchAllEmployees) {

    try {
      const employeeList = <any> await this._emp.getAllEmployees().toPromise().then();

      this.reset(state);
      this.add(state, { payload: employeeList});

    } catch (error) {
      this.errorHandler(error);
    }
  }

  private errorHandler(error) {
    console.log(error);
  }
}
