import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CreatePackageComponent } from './create-package/create-package.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatNativeDateModule, MatRippleModule, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { AgmCoreModule } from '@agm/core';
import {MatRadioModule} from '@angular/material/radio';

import { FuseSharedModule } from '@fuse/shared.module';
import { FuseWidgetModule } from '@fuse/components/widget/widget.module';
import { CreateEmployeeService } from './create-employee/create-employee.service';
import { CreateEmployeeComponent } from './create-employee/create-employee.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatCalendar, MatDatepickerModule } from '@angular/material/datepicker';
import { MatMenuModule } from '@angular/material/menu';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { NgxDnDModule } from '@swimlane/ngx-dnd';
import { FuseSidebarModule } from '@fuse/components';
import { CreateSupervisorComponent } from './create-supervisor/create-supervisor.component';
import { CreateSupervisorService } from './create-supervisor/create-supervisor.service';
import { CreatePropertyComponent } from './create-property/create-property.component';
import { CreatePropertyService } from './create-property/create-property.service';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatStepperModule } from '@angular/material/stepper';
import { CreateExcelService } from './pay/create-excel.service';
import { CreateExcelComponent } from './pay/create-excel.component';
import { MatCard, MatCardModule } from '@angular/material/card';
import { CustomComponentsModule } from 'app/main/ui/custom/custom.module';
import { GooglePlaceModule } from 'ngx-google-places-autocomplete';
import { CreatePackageService } from './create-package/create-package.service';
import { CreatePackageNewComponent } from './create-package-new/create-package-new.component';

const routes: Routes = [
  {
    path: 'create-employee',
    component: CreateEmployeeComponent,
    resolve: {
      data: CreateEmployeeService,
    },
  },
  {
    path: 'create-supervisor',
    component: CreateSupervisorComponent,
    resolve: {
      data: CreateSupervisorService,
    },
  },
  {
    path: 'create-property',
    component: CreatePropertyComponent,
    resolve: {
      data: CreatePropertyService,
    },
  },
  {
    path: 'create-excel',
    component: CreateExcelComponent,
    resolve: {
      data: CreateExcelService,
    },
  },
  {
    path: 'create-package',
    component: CreatePackageComponent,
    resolve: {
      data: CreatePackageService,
    },
  },
  {
    path: 'create-package-new',
    component: CreatePackageNewComponent,
    // resolve: {
    //   data: CreatePackageService,
    // },
  },
];

@NgModule({
  declarations: [
    CreateEmployeeComponent,
    CreateSupervisorComponent,
    CreatePropertyComponent,
    CreateExcelComponent,
    CreatePackageComponent,
    CreatePackageNewComponent
  ],
  imports: [
    GooglePlaceModule,
    RouterModule.forChild(routes),

    MatButtonModule,
    MatChipsModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatPaginatorModule,
    MatRippleModule,
    MatSelectModule,
    MatSortModule,
    MatSnackBarModule,
    MatTableModule,
    MatTabsModule,
    MatAutocompleteModule,
    MatNativeDateModule,
    MatCardModule,
    MatRadioModule,
    // MatCalendar,

    NgxChartsModule,
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyD81ecsCj4yYpcXSLFcYU97PvRsE_X8Bx8',
    }),

    FuseSharedModule,
    FuseWidgetModule,

    MatCheckboxModule,
    MatDatepickerModule,
    MatMenuModule,
    MatSlideToggleModule,

    NgxDnDModule,

    FuseSidebarModule,
    MatStepperModule,
    CustomComponentsModule
  ],
  exports: [CreateExcelComponent, CreateSupervisorComponent, CreatePropertyComponent, CreateEmployeeComponent, CreatePackageComponent],
  providers: [
    CreatePropertyService,
    CreateEmployeeService,
    CreateSupervisorService,
    CreateExcelService,
    CreatePackageService
  ],
})
export class CreatesModule {}
