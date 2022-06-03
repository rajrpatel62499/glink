import { LocationState } from './location.state';
import { Dispatch } from "@ngxs-labs/dispatch-decorator";
import { Reset, Add, SetError, SetLoading } from "@ngxs-labs/entity-state";
import { FetchAllLocations } from './location.actions';

export class LocationDispatchers  {

    @Dispatch() 
    public static fetchAllLocations(){
      return [ new FetchAllLocations()]
    };


    @Dispatch() 
    public static setLocations(payload){
      return [ new Reset(LocationState), new Add(LocationState, payload)]
    };
  
    @Dispatch() 
    public static startLoading(){
      return [ new SetLoading(LocationState, true)]
    };
  
    @Dispatch() 
    public static stopLoading(){
      return [ new SetLoading(LocationState, false)]
    };
  
    @Dispatch() 
    public static setError(error){
      return [ new SetError(LocationState, error)]
    };
  

  
  }