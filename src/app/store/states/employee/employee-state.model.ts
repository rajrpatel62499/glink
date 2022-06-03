import { EntityStateModel, defaultEntityState } from '@ngxs-labs/entity-state';
import { Dictionary } from "@ngxs-labs/entity-state/lib/internal";
import { User } from "app/main/apps/user/user.model";
import { LocationEntity } from '../location/location-state.model';

export class EmployeeStateModel implements EntityStateModel<EmployeeEntity> {

    entities: Dictionary<EmployeeEntity>;
    loading: boolean;
    error: Error;
    active: string;
    ids: string[];
    pageSize: number;
    pageIndex: number;
    lastUpdated: number;

    constructor() { 
        Object.assign(this, { ...this, ...defaultEntityState() });
    }
}

export class EmployeeEntity {
  _id: string;
  first: string;
  last: string;
  currentHours: number;
  initialHours: any;
  fullName: string;
  location: LocationEntity;
  locations: LocationEntity[];
  hireDateStart: string;
  hireDateEnd: string;
  tenurePermanent: string;
  isMobileAppEnabled: boolean;
  isActive: boolean;
  times?: any;
  matricule: string;
  class: string;
  region: string;
  type: string;
  user: User;
  completed: boolean;
  starred: boolean;
  important: boolean;
  deleted: boolean;
  tags: [
    {
      id: number;
      handle: string;
      title: string;
      color: string;
    }
  ];

  constructor(employee) {
    {
      this._id = employee._id;
      this.first = employee.first;
      this.last = employee.last;
      this.currentHours = employee.currentHours;
      this.initialHours = employee.initialHours;
      this.fullName = `${employee.first} ${employee.last}`;
      this.location = employee.location;
      this.locations = employee.locations;
      this.hireDateStart = employee.hireDateStart;
      this.hireDateEnd = employee.hireDateEnd;
      this.tenurePermanent = employee.tenurePermanent;
      this.isMobileAppEnabled = employee.isMobileAppEnabled;
      this.isActive = employee.isActive;
      this.times = employee.times;
      this.matricule = employee.matricule;
      this.class = employee.class;
      this.region = employee.region;
      this.type = employee.type;
      this.user = employee.user;
      this.completed = employee.completed;
      this.starred = employee.starred;
      this.important = employee.important;
      this.deleted = employee.deleted;
      this.tags = employee.tags || [this.generateTagFromType(employee.location)];
    }
  }

  generateTagFromType(type): any {
    var tag: any = (tag = {
      id: 0,
      handle: 'unknown',
      title: 'Unknown',
      color: '#F44336',
    });

    return tag;
  }

  toggleStar(): void {
    this.starred = !this.starred;
  }

  toggleImportant(): void {
    this.important = !this.important;
  }

  toggleCompleted(): void {
    this.completed = !this.completed;
  }

  toggleDeleted(): void {
    this.deleted = !this.deleted;
  }
}

export class AnkaGeoLocation {
    coordinates: number[];
    name: string;
}
