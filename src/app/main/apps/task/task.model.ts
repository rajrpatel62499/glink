import { User } from '../user/user.model';
export class Task {
  _id: string;
  timeStart: string;
  timeEnd: string;
  title: string;
  description: string;
  dateStart: string;
  dateEnd: string;
  countEntries: number;
  timezone: string;
  property: User;
  recurrence: string;
  type: string;
  status: string;
  batchId: string;

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

  createdBy: User;
  isImageRequired: boolean;

  constructor(task) {
    {
      this._id = task._id;
      this.title = task.title;
      this.description = task.description;
      this.timeStart = task.timeStart;
      this.timeEnd = task.timeEnd;
      this.dateStart = task.dateStart;
      this.dateEnd = task.dateEnd;
      this.countEntries = task.countEntries;
      this.timezone = task.timezone;
      this.property = new User(task.property ? task.property : {});
      this.recurrence = task.recurrence;
      this.type = task.type;
      this.status = task.status;
      this.batchId = task.batchId;
      this.createdBy = new User(task.createdBy ? task.createdBy : {});
      this.isImageRequired = task.isImageRequired;
      this.completed = task.completed;
      this.starred = task.starred;
      this.important = task.important;
      this.deleted = task.deleted;
      this.tags = task.tags || [this.generateTagFromType(task.property)];
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
