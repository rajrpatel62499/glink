import { EntityStateModel, defaultEntityState } from '@ngxs-labs/entity-state';
import { Dictionary } from "@ngxs-labs/entity-state/lib/internal";
import { User } from "app/main/apps/user/user.model";

export class LocationStateModel implements EntityStateModel<LocationEntity> {

    entities: Dictionary<LocationEntity>;
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

export class LocationEntity {
  _id: string;
  name: string;
  address: string;
  supervisor: User;
  property: User;
  division: string;
  employees: [];
  isDeleted: boolean;
  isActive: boolean;
  clientCode?: string;
  geolocation: AnkaGeoLocation;
  createdBy: User;
  modifiedBy: User;

  notes: string;
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

  /**
   * Constructor
   *
   * @param location
   */
  constructor(location) {
    {
      this._id = location._id;
      this.name = location.name;
      this.address = location.address;
      this.supervisor = location.supervisor;
      this.property = location.property;
      this.division = location.division;
      this.employees = location.employees;
      this.isDeleted = location.isDeleted;
      this.isActive = location.isActive;
      this.geolocation = location.geolocation;
      this.clientCode = location.clientCode;
      this.createdBy = location.createdBy;
      this.modifiedBy = location.modifiedBy;
      this.notes = location.notes;
      this.completed = location.completed;
      this.starred = location.starred;
      this.important = location.important;
      this.deleted = location.deleted;
      this.tags = location.tags || [this.generateTagFromType(location.type)];
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

  /**
   * Toggle star
   */
  toggleStar(): void {
    this.starred = !this.starred;
  }

  /**
   * Toggle important
   */
  toggleImportant(): void {
    this.important = !this.important;
  }

  /**
   * Toggle completed
   */
  toggleCompleted(): void {
    this.completed = !this.completed;
  }

  /**
   * Toggle deleted
   */
  toggleDeleted(): void {
    this.deleted = !this.deleted;
  }
}

export class AnkaGeoLocation {
    coordinates: number[];
    name: string;
}
  