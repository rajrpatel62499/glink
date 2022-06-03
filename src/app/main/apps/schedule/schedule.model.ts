import { Employee } from '../employee/models/employee.model';
import { ALocation } from '../location/location.model';

export class Schedule {
  _id: string;
  employee: Employee;
  location: ALocation;
  timeStart: string;
  timeEnd: string;
  punchIn: string;
  punchOut: string;
  status: string; //{ type: String, enum: ['REGULAR', 'HOLIDAY-WORK', 'HOLIDAY-OFF', 'OFF', 'VACATION', 'ABSENT', 'EXCUSED', 'SICK', 'UNKNOWN'], default: 'UNKNOWN'},
  punchInStatus: string; //{ type: String, enum: ['EARLY', 'PROMPT', 'LATE', 'UNKNOWN'], default: 'UNKNOWN'},
  punchOutStatus: string; //{ type: String, enum: ['EARLY', 'PROMPT', 'LATE', 'UNKNOWN'], default: 'UNKNOWN'}

  dateRangeStart: string;
  dateRangeEnd: string;

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

  constructor(schedule) {
    {
      this._id = schedule._id;
      this.employee = new Employee(schedule.employee ? schedule.employee : {});
      this.location = new ALocation(schedule.location);
      this.timeStart = schedule.timeStart;
      this.timeEnd = schedule.timeEnd;
      this.punchIn = schedule.punchIn;
      this.punchOut = schedule.punchOut;
      this.status = schedule.status;
      this.punchInStatus = schedule.punchInStatus;
      this.punchOutStatus = schedule.punchOutStatus;
      this.completed = schedule.completed;
      this.starred = schedule.starred;
      this.important = schedule.important;
      this.deleted = schedule.deleted;
      this.tags = schedule.tags || [this.generateTagFromType(schedule.location)];
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
