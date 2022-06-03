import { Injectable } from '@angular/core';
import { EntityState, IdStrategy } from '@ngxs-labs/entity-state';
import { State, Action, StateContext } from '@ngxs/store';
import { LocationStateModel, LocationEntity } from './location-state.model';
import { LocationStateService } from './location-state.service';
import { FetchAllLocations } from './location.actions';


const defaults = new LocationStateModel();

@State<LocationStateModel>({
  name: 'location',
  defaults
})
@Injectable()
export class LocationState extends EntityState<LocationEntity> {

  constructor(private _loc: LocationStateService ) {
    super( LocationState, '_id', IdStrategy.EntityIdGenerator);
  }

  @Action(FetchAllLocations)
  async fetchAll(state: StateContext<LocationStateModel>, action: FetchAllLocations) {

    try {
      const locationList = <any> await this._loc.getAllLocations().toPromise().then();

      this.reset(state);
      this.add(state, { payload: locationList});
      
    } catch (error) {
      this.errorHandler(error);
    }
  }

  private errorHandler(error) {
    console.log(error);
  }
}
