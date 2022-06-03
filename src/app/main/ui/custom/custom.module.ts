import { FigmaPackageSearchComponent } from './figma-package-search/figma-package-search.component';
import { FigmaPackageListHeaderComponent } from './figma-package-list-header/figma-package-list-header.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';

import { FuseSharedModule } from '@fuse/shared.module';
import {
  FuseConfirmDialogModule,
  FuseHighlightModule,
  FuseMaterialColorPickerModule,
} from '@fuse/components';
import { CustomComponent } from './custom.component';
import { FigmaHeaderComponent } from './figma-header/figma-header.component';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatRadioModule } from '@angular/material/radio';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { FigmaSearchComponent } from './figma-search/figma-search.component';
import { FigmaChipUserComponent } from './figma-chip-user/figma-chip-user.component';
import { FigmaChipEmployeeComponent } from './figma-chip-employee/figma-chip-employee.component';
import { FigmaScheduleSearchComponent } from './figma-schedule-search/figma-schedule-search.component';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { NgxDnDModule } from '@swimlane/ngx-dnd';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { FigmaChipScheduleComponent } from './figma-chip-schedule/figma-chip-schedule.component';
import { FigmaScheduleListHeaderComponent } from './figma-schedule-list-header/figma-schedule-list-header.component';
import { FigmaTaskSearchComponent } from './figma-task-search/figma-task-search.component';
import { FigmaChipTaskComponent } from './figma-chip-task/figma-chip-task.component';
import { FigmaTaskListHeaderComponent } from './figma-task-list-header/figma-task-list-header.component';
import { MultipleSelectionComponent } from './multiple-selection/multiple-selection.component';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { FigmaPrivacyAgreementComponent } from './figma-privacy-agreement-content/figma-privacy-agreement.component';
import { FigmaPrivacyAgreementButtonComponent } from './figma-privacy-agreement-button/figma-privacy-agreement-button.component';
import { FigmaPrivacyAgreementContentEnFrComponent } from './figma-privacy-agreement-content-en-fr/figma-privacy-agreement-content-en-fr.component';
import { FigmaDatePickerComponent } from './figma-date-picker/figma-date-picker.component';
import { FigmaTableComponent } from './figma-table/figma-table.component';
import {MatTableModule} from '@angular/material/table';
import { FigmaSearchDropdownComponent } from './figma-search-dropdown/figma-search-dropdown.component';
import { FigmaAutoRangeDatepickerComponent } from './figma-auto-range-datepicker/figma-auto-range-datepicker.component';
import { FigmaImageGalleryComponent } from './figma-image-gallery/figma-image-gallery.component';
import { FigmaAutocompleteComponent } from './figma-autocomplete/figma-autocomplete.component';
import { FigmaChipPackageComponent } from './figma-chip-package/figma-chip-package.component';
const routes: Routes = [
  {
    path: 'custom',
    component: CustomComponent,
  },
];

@NgModule({
  declarations: [
    CustomComponent,
    FigmaHeaderComponent,
    FigmaSearchComponent,
    FigmaChipUserComponent,
    FigmaChipEmployeeComponent,
    
    FigmaScheduleSearchComponent,
    FigmaChipScheduleComponent,
    FigmaScheduleListHeaderComponent,
    
    FigmaChipPackageComponent,
    FigmaPackageListHeaderComponent,
    FigmaPackageSearchComponent,

    FigmaTaskSearchComponent,
    FigmaChipTaskComponent,
    FigmaTaskListHeaderComponent,
    MultipleSelectionComponent,
    FigmaPrivacyAgreementComponent,
    FigmaPrivacyAgreementButtonComponent,
    FigmaPrivacyAgreementContentEnFrComponent,
    FigmaDatePickerComponent,
    FigmaTableComponent,
    FigmaSearchDropdownComponent,
    FigmaAutoRangeDatepickerComponent,
    FigmaImageGalleryComponent,
    FigmaAutocompleteComponent,
  ],
  exports: [
    CustomComponent,
    FigmaHeaderComponent,
    FigmaSearchComponent,
    FigmaChipUserComponent,
    FigmaChipEmployeeComponent,

    FigmaScheduleSearchComponent,
    FigmaChipScheduleComponent,
    FigmaScheduleListHeaderComponent,
    
    FigmaChipPackageComponent,
    FigmaPackageListHeaderComponent,
    FigmaPackageSearchComponent,

    FigmaTaskSearchComponent,
    FigmaChipTaskComponent,
    FigmaTaskListHeaderComponent,
    FigmaDatePickerComponent,
    FigmaAutoRangeDatepickerComponent,
    FigmaTableComponent,
    FigmaSearchDropdownComponent,
    MultipleSelectionComponent,
    FigmaPrivacyAgreementComponent,
    FigmaPrivacyAgreementButtonComponent,
    FigmaPrivacyAgreementContentEnFrComponent,
    FigmaAutocompleteComponent
  ],
  imports: [
    RouterModule.forChild(routes),

    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
    MatRadioModule,
    MatSidenavModule,
    MatToolbarModule,

    // MatButtonModule,
    // MatCheckboxModule,
    // MatChipsModule,
    MatDatepickerModule,
    MatTableModule,
    // MatDialogModule,
    MatFormFieldModule,
    // MatIconModule,
    // MatInputModule,
    // MatListModule,
    // MatMenuModule,
    // MatProgressBarModule,
    // MatRippleModule,
    // MatSidenavModule,
    // MatToolbarModule,
    // MatTooltipModule,
    MatAutocompleteModule,
    // MatSlideToggleModule,

    NgxDnDModule,

    // FuseSharedModule,
    // FuseConfirmDialogModule,
    // FuseMaterialColorPickerModule,
    // MatSelectModule,
    // MatSnackBarModule,

    FuseSharedModule,
    FuseConfirmDialogModule,
    FuseMaterialColorPickerModule,
    MatSelectModule,
    MatSnackBarModule,
    NgxMatSelectSearchModule,
  ],
})
export class CustomComponentsModule {}
