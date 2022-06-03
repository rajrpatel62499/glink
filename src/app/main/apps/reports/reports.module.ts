import { MatInputModule } from '@angular/material/input';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReportsRoutingModule } from './reports-routing.module';
import { ReportsComponent } from './reports.component';
import { TimesheetsComponent } from './timesheets/timesheets.component';
import { FuseWidgetModule } from '@fuse/components';
import { FuseSharedModule } from '@fuse/shared.module';
import { CustomComponentsModule } from 'app/main/ui/custom/custom.module';
import { MatCardModule } from '@angular/material/card';
import { EmployeeTimesheetComponent } from './timesheets/employee-timesheet/employee-timesheet.component';
import { ClientTimesheetComponent } from './timesheets/client-timesheet/client-timesheet.component';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatMenuModule } from '@angular/material/menu';
import { PayrollsComponent } from './payrolls/payrolls.component';
import { PayrollComponent } from './payrolls/payroll/payroll.component';
import { PayrollService } from './payrolls/payroll.service';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { MatListModule } from '@angular/material/list';
import { PictureExtractionComponent } from './timesheets/picture-extraction/picture-extraction.component';
import { DeviceListComponent } from './timesheets/device-list/device-list.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { GetCategoryColorCodePipe } from './timesheets/picture-extraction/GetCategoryColorCode.pipe';
import { DepartmentHrComponent } from './department-hr/department-hr.component';
const modules = [
  MatCardModule,
  MatMenuModule,
  MatFormFieldModule,
  MatInputModule,
  MatDatepickerModule,
  MatSelectModule,
  MatIconModule,
  NgxDatatableModule,
  MatProgressSpinnerModule,
  MatListModule,
];

const pipes = [GetCategoryColorCodePipe];

@NgModule({
  declarations: [
    ReportsComponent,
    TimesheetsComponent,
    EmployeeTimesheetComponent,
    ClientTimesheetComponent,
    PayrollsComponent,
    PayrollComponent,
    PictureExtractionComponent,
    DeviceListComponent,
    ...pipes,
    DepartmentHrComponent,
  ],
  imports: [
    CommonModule,
    ...modules,
    ReportsRoutingModule,
    FuseSharedModule,
    FuseWidgetModule,
    CustomComponentsModule,
  ],
  providers: [PayrollService],
})
export class ReportsModule {}
