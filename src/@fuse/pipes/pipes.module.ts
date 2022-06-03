import { CamelCaseToDashPipe } from './camelCaseToDash.pipe';
import { FilterPipe } from './filter.pipe';
import { GetByIdPipe } from './getById.pipe';
import { GetBy_IdPipe } from './getBy_Id.pipe';
import { HtmlToPlaintextPipe } from './htmlToPlaintext.pipe';
import { KeysPipe } from './keys.pipe';
import { NgModule } from '@angular/core';
import { AnkaDateAgoPipe } from './ankaDateAgo.pipe';
import { SortByTranslatePipe } from './sortByTranslate.pipe';
import { RecurrenceStrPipe } from './recurrenceStr.pipe';


const pipes = [
  KeysPipe,
  GetByIdPipe,
  GetBy_IdPipe,
  HtmlToPlaintextPipe,
  FilterPipe,
  CamelCaseToDashPipe,
  AnkaDateAgoPipe,
  SortByTranslatePipe,
  RecurrenceStrPipe
];
@NgModule({
  declarations: [
    ...pipes
  ],
  imports: [],
  exports: [
    ...pipes
  ],
})
export class FusePipesModule {}
