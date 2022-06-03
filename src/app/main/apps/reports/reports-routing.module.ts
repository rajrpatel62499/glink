import { DepartmentHrComponent } from './department-hr/department-hr.component';
import { DeviceService } from './timesheets/device-list/device.service';
import { DeviceListComponent } from './timesheets/device-list/device-list.component';
import { PictureExtractionComponent } from './timesheets/picture-extraction/picture-extraction.component';
import { PayrollsComponent } from './payrolls/payrolls.component';
import { TimeSheetService } from './timesheets/timesheet.service';
import { ClientTimesheetComponent } from './timesheets/client-timesheet/client-timesheet.component';
import { EmployeeTimesheetComponent } from './timesheets/employee-timesheet/employee-timesheet.component';
import { TimesheetsComponent } from './timesheets/timesheets.component';
import { ReportsComponent } from './reports.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PayrollComponent } from './payrolls/payroll/payroll.component';
import { PayrollService } from './payrolls/payroll.service';
import { PictureExtractionService } from './timesheets/picture-extraction/picture-extraction.service';

const routes: Routes = [
  {
    path: 'all',
    component: ReportsComponent,
  },
  {
    path: 'operations',
    component: TimesheetsComponent,
    pathMatch: 'full',
  },
  {
    path: 'operations/employee',
    component: EmployeeTimesheetComponent,
    pathMatch: 'full',
    resolve: {
      data: TimeSheetService
    }
  },
  {
    path: 'operations/client',
    component: ClientTimesheetComponent,
    pathMatch: 'full',
    resolve: {
      data: TimeSheetService
    }
  },
  {
    path: 'operations/picture-extraction',
    component: PictureExtractionComponent,
    pathMatch: 'full',
    resolve: {
      data: PictureExtractionService,
      timesheetData: TimeSheetService
    }
  },
  {
    path: 'operations/devices',
    component: DeviceListComponent,
    pathMatch: 'full',
    resolve: {
      data: DeviceService
    }
  },

  // payroll routes
  {
    path: 'payrolls',
    component: PayrollsComponent,
    pathMatch: 'full',
    // resolve: {
    //   banner: PayrollService,
    // },
  },
  {
    path: 'payrolls/finance',
    component: PayrollComponent,
    pathMatch: 'full',
    resolve: {
      banner: PayrollService,
    },
  },
  
  // HR routes
  {
    path: 'hr',
    component: DepartmentHrComponent,
    pathMatch: 'full',
  },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ReportsRoutingModule {}
