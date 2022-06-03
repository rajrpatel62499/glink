export class TimesheetStateModel {
  public schedules: TimeSheetEntity[];
}

export class TimeSheetEntity {
  status: string;
  punchInStatus: string;
  punchOutStatus: string;
  alertStoppedPunchIn?: any;
  alertStoppedPunchOut?: any;
  isActive: boolean;
  _id: string;
  employee: string;
  location: string;
  timeStart: Date;
  timeEnd: Date;
  punchIn?: any;
  punchOut?: any;
  timezone: string;

  constructor(obj) {
    this.status = obj?.status;
    this.punchInStatus = obj?.punchInStatus;
    this.punchOutStatus = obj?.punchOutStatus;
    this.alertStoppedPunchIn = obj?.alertStoppedPunchIn;
    this.alertStoppedPunchOut = obj?.alertStoppedPunchOut;
    this.isActive = obj?.isActive;
    this._id = obj?._id;
    this.employee = obj?.employee;
    this.location = obj?.location;
    this.timeStart = obj?.timeStart;
    this.timeEnd = obj?.timeEnd;
    this.punchIn = obj?.punchIn;
    this.punchOut = obj?.punchOut;
    this.timezone = obj?.timezone;
  }
}
