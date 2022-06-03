import { ALocation } from '../location/location.model';

enum UserType {
  UNKNOWN = 'UNKNOWN',
  PROPERTY = 'PROPERTY',
  SUPERVISOR = 'SUPERVISOR',
  ADMIN = 'ADMIN',
}
export class User {
  _id: string;
  username: string;
  password: string;
  first: string;
  last: string;
  name: string;
  type: UserType;
  email: string;
  updatedAt: string;
  modifiedAt: string;
  locations: ALocation[];
  devices: [];
  deviceSerialNumber: String;
  eula: string;
  banner: string;

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
  avatar: string;
  status: string;
  unread: number;
  mood: string;

  /**
   * Constructor
   *
   * @param user
   */
  constructor(user) {
    {
      this._id = user._id;
      this.username = user.username;
      this.password = user.password;
      this.first = user.first;
      this.last = user.last;
      this.name = user.name;
      this.type = user.type;
      this.email = user.email;
      this.locations = user.locations;
      this.deviceSerialNumber = user.deviceSerialNumber;
      this.eula = user.eula;
      this.banner = user.banner;
      this.updatedAt = user.startDate;
      this.modifiedAt = user.dueDate;
      this.notes = user.notes;
      this.completed = user.completed;
      this.starred = user.starred;
      this.important = user.important;
      this.deleted = user.deleted;
      this.tags = user.tags || [this.generateTagFromType(user.type)];
      this.avatar = 'assets/images/avatars/profile.jpg';
      this.status = 'online';
      this.unread = null;
      this.mood = 'Lorem ipsum';
    }
  }

  generateTagFromType(type: UserType): any {
    var tag: any = (tag = {
      id: 0,
      handle: 'unknown',
      title: 'Unknown',
      color: '#388E3C',
    });
    switch (type) {
      case UserType.PROPERTY:
        tag = {
          id: 1,
          handle: 'property',
          title: 'Property',
          color: '#F44336',
        };
        break;
      case UserType.SUPERVISOR:
        tag = {
          id: 2,
          handle: 'supervisor',
          title: 'Supervisor',
          color: '#FF9800',
        };
        break;
      case UserType.ADMIN:
        tag = {
          id: 3,
          handle: 'admin',
          title: 'Admin',
          color: '#0091EA',
        };
        break;
    }
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
  toggleEditMode(): void {
    this.completed = !this.completed;
  }

  /**
   * Toggle deleted
   */
  toggleDeleted(): void {
    this.deleted = !this.deleted;
  }
}
