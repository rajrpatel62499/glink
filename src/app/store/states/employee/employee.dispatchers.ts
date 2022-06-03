import { Dispatch } from "@ngxs-labs/dispatch-decorator";
import { Reset, Add, SetError, SetLoading } from "@ngxs-labs/entity-state";
import { FetchAllEmployees } from './employee.actions';
import { EmployeeState } from "./employee.state";

export class EmployeeDispatchers  {

    @Dispatch()
    public static fetchAllEmployees(){
      return [ new FetchAllEmployees()]
    };


    // @Dispatch()
    // public static setLocations(payload){
    //   return [ new Reset(EmployeeState), new Add(EmployeeState, payload)]
    // };

    // @Dispatch()
    // public static startLoading(){
    //   return [ new SetLoading(EmployeeState, true)]
    // };

    // @Dispatch()
    // public static stopLoading(){
    //   return [ new SetLoading(EmployeeState, false)]
    // };

    // @Dispatch()
    // public static setError(error){
    //   return [ new SetError(EmployeeState, error)]
    // };



  }
