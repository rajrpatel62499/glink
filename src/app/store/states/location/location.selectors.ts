import { Selector } from "@ngxs/store";
import { LocationEntity, LocationStateModel } from "./location-state.model";
import { LocationState } from "./location.state";

export class LocationSelectors {
    // base selector
    @Selector([LocationState.entities])
    static locations(locations: LocationEntity[]) {
      return locations;
    }

    @Selector([LocationSelectors.locations])
    static locationAutoCompleteOptions(locations: LocationEntity[]) {
      return locations
      .map((loc) => { return { viewValue: loc.name, value: loc._id}})
      .sort((a,b) => a.viewValue  > b.viewValue ? 1 : -1 );;
    }


  }