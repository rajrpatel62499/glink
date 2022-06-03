import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { IRuleOptions } from '@rschedule/core';
import { DateAdapter } from 'angular-calendar';
import moment from 'moment';

@Pipe({ name: 'recurrenceStr' })
export class RecurrenceStrPipe implements PipeTransform {
  self: any;
  constructor(private _translate: TranslateService) {
    this.self = this;
  }
  /**
   * Transform
   *
   * @param {IRuleOptions} opt
   * @param {string[]} args
   * @returns {any}
   */
  transform(opt: IRuleOptions, result: string[], time: string): any {
    let str = '';
    
    str = this.every(str, opt);

    str += ' '; 

    str = this.daily(str, opt);
    str = this.weekly(str, opt);
    str = this.monthly(str, opt);

    if (opt.frequency == 'MONTHLY' || opt.frequency == 'DAILY') {
      //TODO: remianing
      str = this.time(str, opt, time);
    }
    str = this.end(str, opt, result);
    str = this.count(str, opt);

    return str;
  }

  every(str, opt: IRuleOptions) {
    const every = this.translate('Every');
    const each = this.translate('Each');

    opt.interval == 1 ? (str += `${each}`) : (str += `${every}`); // Tous les, Chaque

    return str;
  }



  daily(str, opt: IRuleOptions) {
    if (opt?.frequency !== 'DAILY') return str;

    const day = this.translate('day');
    const days = this.translate('days');

    opt.interval == 1 ? (str += `${day}`) : (str += `${opt.interval} ${days}`); // day, 2 days, 3 days,

    return str;
  }

  weekly(str, opt: IRuleOptions) {
    if (opt?.frequency !== 'WEEKLY') return str;
    const weekdays = opt.byDayOfWeek;

    const week = this.translate('week');
    const weeks = this.translate('weeks');
    const on = this.translate('on');

    opt.interval == 1 ? (str += `${week}`) : (str += `${opt.interval} ${weeks}`); // day, 2 days, 3 days,

    // on Mon, Tue, Thu
    if (weekdays && weekdays.length > 0) {
      str += ` ${on} `;

      weekdays.forEach((weekday, i) => {
        str += `${this.translate(weekday)}`;
        i !== weekdays.length - 1 ? (str += ', ') : '';
      });
    }

    return str;
  }

  monthly(str, opt: IRuleOptions) {
    if (opt?.frequency !== 'MONTHLY') return str;

    const month = this.translate('month');
    const months = this.translate('months');
    const on_the = this.translate('on the');
    const of_the_month = this.translate('of the month');
    const monthdays = opt?.byDayOfMonth;
    const weekday = opt?.byDayOfWeek && opt?.byDayOfWeek.length > 0 ? opt.byDayOfWeek[0] : null;

    opt?.interval == 1 ? (str += `${month}`) : (str += `${opt.interval} ${months}`); // day, 2 days, 3 days,

    if (monthdays && monthdays.length > 0) {
      str += ` ${on_the} ${monthdays[0]}`;
      opt.interval == 1 ? (str += ` ${of_the_month}`) : '';
    }

    if (weekday) {
      const day = this.translate(`${weekday[0]}`);
      const order = this.getDayOfMonthNames()
        .find((x) => x.id == weekday[1])
        .viewValue;

      str += ` ${this.translate(order)} ${day}`; // First Tue, Second Mon,
    }

    return str;
  }

  time(str, opt: IRuleOptions, time: string) {

    const ending_at = this.translate('ending at')

    if (time) {
      const times = time && time.split(":").length == 2 ? time.split(":") : ['0', '0'];
      
      if (+times[0] >= 12) {
        str+= `, ${ending_at} ${+times[0] - 12 == 0 ? 12 : +times[0] - 12 }:${times[1]} PM` 
      } else {
        str+= `, ${ending_at} ${+times[0]  == 0 ? 12 : +times[0] }:${times[1]} AM` 
      }

    } 
    return str;
  }

  end(str, opt: IRuleOptions, result) {
    if (!opt?.end) return str;

    const until = this.translate('until');
    const occurences = this.translate('occurrence(s)');

    const lang = this._translate.currentLang;
    
    const endDate = lang == 'en' ? moment(opt.end.toISOString()).format('MMM D, YYYY'): moment(opt.end.toISOString()).format('D MMM, YYYY');
    const total = result.length;

    if (opt.end) {
      str += `, ${until} ${endDate} `;
      total ? (str += `${total} ${occurences}`) : '';
    }

    return str;
  }

  count(str, opt: IRuleOptions) {
    if (!opt?.count) return str;
    const occurences = this.translate('occurrence(s)');

    const total = opt.count;
    if (total) {
      str += `, ${total} ${occurences}`;
    }
    return str;
  }

  // Helper functions
  //NOTE: custom translation
  translate(key: any): string {
    const lang = this._translate?.currentLang ? this._translate.currentLang : 'en';

    const data = {
      SU: { en: 'Sun', fr: 'Dim' },
      MO: { en: 'Mon', fr: 'Lun' },
      TU: { en: 'Tue', fr: 'Mar' },
      WE: { en: 'Wed', fr: 'Mer' },
      TH: { en: 'Thu', fr: 'Jeu' },
      FR: { en: 'Fri', fr: 'Ven' },
      SA: { en: 'Sat', fr: 'Sam' },
      
      First: { en: 'First', fr: 'Premier' },
      Second: { en: 'Second', fr: 'Deuxième' },
      Third: { en: 'Third', fr: 'Troisième' },
      Fourth: { en: 'Fourth', fr: 'Quatrième' },
      Last: { en: 'Last', fr: 'Dernier' },

      until: { en: 'until', fr: `jusqu’au` },
      Every: { en: 'Every', fr: 'Tous les' },
      Each: { en: 'Every', fr: 'Chaque' },
      day: { en: 'day', fr: 'jour' },
      days: { en: 'days', fr: 'jours' },
      month: { en: 'month', fr: 'mois' },
      months: { en: 'months', fr: 'mois' },
      week: { en: 'week', fr: 'semaine' },
      weeks: { en: 'weeks', fr: 'semaines' },
      on: { en: 'on', fr: 'le' },
      'on the': { en: 'on the', fr: 'sur le' },
      'of the month': { en: 'of the month', fr: 'du mois' },
      'ending at': { en: 'ending at', fr: 'se terminant à' },
      'occurrence(s)': { en: 'occurrence(s)', fr: 'événement(s)' },
    };

    if (data[key]) {
      return data[key][lang];
    }

    const val = this._translate.instant(key);
    return val ? val : '';
  }

  private getDayOfMonthNames() {
    return [
      { id: 1, viewValue: 'First' },
      { id: 2, viewValue: 'Second' },
      { id: 3, viewValue: 'Third' },
      { id: 4, viewValue: 'Fourth' },
      { id: -1, viewValue: 'Last' },
    ];
  }
}
