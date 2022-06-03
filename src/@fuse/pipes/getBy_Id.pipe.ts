import { Pipe, PipeTransform } from '@angular/core';

import { de } from 'date-fns/locale';

@Pipe({
  name: 'getBy_Id',
  pure: false,
})
export class GetBy_IdPipe implements PipeTransform {
  /**
   * Transform
   *
   * @param {any[]} value
   * @param {number} _id
   * @param {string} property
   * @returns {any}
   */
  transform(value: any[], id: number, property: string): any {
    const foundItem = value.find((item) => {
      if (item._id !== undefined) {
        return item._id === id;
      }

      return false;
    });

    if (foundItem) {
      return foundItem[property];
    }
  }
}
