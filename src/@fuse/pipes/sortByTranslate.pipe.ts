import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Pipe({ name: 'sortByTranslate' })
export class SortByTranslatePipe implements PipeTransform {
  constructor(private translate: TranslateService) {}

  transform(array: Array<string>): Array<string> {
    array.sort((a: any, b: any) => {
      a = this.translate.instant(a);
      b = this.translate.instant(b);
      if (a < b) return -1;
      else if (a > b) return 1;
      else return 0;
    });
    return array;
  }
}
