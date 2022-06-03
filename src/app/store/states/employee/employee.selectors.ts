import { EmployeeState } from './employee.state';
import { Selector } from "@ngxs/store";
import { EmployeeEntity } from './employee-state.model';

export class EmployeeSelectors {
    // base selector
    @Selector([EmployeeState.entities])
    static employees(employees: EmployeeEntity[]) {
      return employees;
    }

    @Selector([EmployeeSelectors.employees])
    static employeeAutoCompleteOptions(employees: EmployeeEntity[]) {
      return employees
      .map(emp => { return { viewValue: emp.fullName, value: emp._id} })
      .sort((a,b) => a.viewValue  > b.viewValue ? 1 : -1 );
    }


  }