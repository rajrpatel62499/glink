import { Pipe, PipeTransform } from '@angular/core';

const categoriesSelections = [
  { id: 1, value: 'Cleaning', selected: true, backgroundColor: '#C2EFCE', textColor: '#207936'},
  { id: 2, value: 'Carpets', selected: true, backgroundColor: '#CCF1FF', textColor: '#0094CC'},
  { id: 3, value: 'Offices', selected: true, backgroundColor: '#FFF4E5', textColor: '#CC7700'},
  { id: 4, value: 'Floors', selected: true, backgroundColor: '#D9CCFF', textColor: '#9700CC'},
  { id: 5, value: 'Front Desk', selected: true, backgroundColor: '#F2CCFF', textColor: '#9700CC'},
  { id: 6, value: 'Backstore', selected: true, backgroundColor: '#FEFFCC', textColor: '#646600'},
  { id: 7, value: 'Others', selected: true, backgroundColor: 'lightgray', textColor: 'black'},
]

@Pipe({
  name: 'GetCategoryColorCodePipe'
})
export class GetCategoryColorCodePipe implements PipeTransform {

  transform(category: string, whichColor: string = 'text'): any {
    if (!(typeof category == 'string')) return 'lightgray'
    
    let categoryIndex = categoriesSelections.findIndex(x => x.value.toLowerCase() == category.toLowerCase());
    if (categoryIndex != -1) {
      if (whichColor == 'background') {
        return categoriesSelections[categoryIndex].backgroundColor;
      } else if (whichColor == 'text') {
        return categoriesSelections[categoryIndex].textColor;
      } else {
        return 'black';
      }
      
    }
    return 'lightgray';
  }

}
