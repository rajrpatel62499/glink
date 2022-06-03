// import { Pipe, PipeTransform } from '@angular/core';

// @Pipe({name: 'htmlToPlaintext'})
// export class HtmlToPlaintextPipe implements PipeTransform
// {
//     /**
//      * Transform
//      *
//      * @param {string} value
//      * @param {any[]} args
//      * @returns {string}
//      */
//     transform(value: string, args: any[] = []): string
//     {
//         return value ? String(value).replace(/<[^>]+>/gm, '') : '';
//     }
// }

import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';

// import { DatePipe } from '@angular/common';

// import { DEFAULT_DATE_FORMAT } from "./app-config";

@Pipe({
  name: 'ankaDateAgo',
})
export class AnkaDateAgoPipe implements PipeTransform {
  constructor() {}

  transform(value: Date | number | string, ...options: string[]): string {
    // now
    const currentDate = new Date();
    const currentTimestamp = currentDate.getTime();

    const forwardedTimestamp = new Date(value).getTime();
    const difference = currentTimestamp - forwardedTimestamp;

    var d = moment.duration(difference, 'milliseconds');
    var months = Math.floor(d.asMonths());
    var days = Math.floor(d.asDays());
    var hours = Math.floor(d.asHours());
    var mins = Math.floor(d.asMinutes());
    //  - hours * 60;
    var secs = Math.floor(d.asSeconds());

    if (difference < 0) {
      return 'Future date not allowed.';
    } else if (months > 0) {
      return `${months} month${months > 1 ? 's' : ''} ago`;
    } else if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (mins > 0) {
      return `${mins} min${mins > 1 ? 's' : ''} ago`;
    } else if (secs >= 0) {
      return `just now`;
    }
    return `Invalid date`;
  }
}
