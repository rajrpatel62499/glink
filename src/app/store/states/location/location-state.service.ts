import { tap, map } from 'rxjs/operators';
import { from, Observable } from 'rxjs';
import { ApiUrls } from '../../ApiUrls';
import { ApiService } from './../../services/api.service';
import { Injectable } from '@angular/core';
import { UtilService } from 'app/store/services/util.service';
import { Select, Store } from '@ngxs/store';
import { FetchAllLocations } from './location.actions';
import { LocationEntity } from './location-state.model';

@Injectable({
  providedIn: 'root',
})
export class LocationStateService {

  
  constructor(private api: ApiService, private util: UtilService, private store: Store) {}

  ngOnInit() {}

  getAllLocations(paramsObj?) {
    const url = ApiUrls.location.getAllLocations;
    const req = this.api.get({ url, paramsObj, callState: FetchAllLocations.type }).catch(this.errorHandler);

    const mapData = (res: { locations: any[]}) => {
      const locationList = res.locations.map((location) => {
        return new LocationEntity(location);
      });
      return locationList;
    }

    return from(req).pipe(map(mapData));

  }


  private errorHandler(error) {
    console.log(error);
  }

}
