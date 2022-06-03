import * as moment from 'moment';

export class Device {
  _id?: string;
  deviceName?: string;
  lastReported?: string;
  lastReportedFriendlyDate?: string;
  lastUpdate?: string;
  compliant?: boolean;
  batteryLevel?: Number;
  appVersion?: string;
  osVersion?: string;
  updatedAt?: string;

  constructor(device) {
    {
      this._id = device._id;
      this.deviceName = device.deviceName;
      this.lastReported = device.lastReported;
      this.lastReportedFriendlyDate = moment(device.lastReported).fromNow() ;
      this.lastUpdate = moment(device.updatedAt).fromNow();
      this.compliant = device.compliant;
      this.batteryLevel = device.batteryLevel;
      this.appVersion = device.appVersion;
      this.osVersion = device.osVersion;
    }
  }
}
