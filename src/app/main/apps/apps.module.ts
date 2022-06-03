import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FuseSharedModule } from '@fuse/shared.module';

const routes = [
  {
    path: 'clients',
    loadChildren: () => import('./client/client.module').then((m) => m.ClientModule),
  },
  {
    path: 'user',
    loadChildren: () => import('./user/figma.module').then((m) => m.FigmaUserModule),
  },
  {
    path: 'employee',
    loadChildren: () => import('./employee/figma.module').then((m) => m.FigmaEmployeeModule),
  },
  {
    path: 'schedule',
    loadChildren: () => import('./schedule/figma.module').then((m) => m.FigmaScheduleModule),
  },
  {
    path: 'package',
    loadChildren: () => import('./package/figma.module').then((m) => m.FigmaPackageModule),
  },
  {
    path: 'task',
    loadChildren: () => import('./task/figma.module').then((m) => m.FigmaTaskModule),
  },
  {
    path: 'chats',
    loadChildren: () => import('./chat/chat.module').then((m) => m.ChatModule),
  },
  {
    path: 'reports',
    loadChildren: () => import('./reports/reports.module').then((m) => m.ReportsModule),
  },
  {
    path: '**',
    loadChildren: () => import('./client/client.module').then((m) => m.ClientModule),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes), FuseSharedModule],
})
export class AppsModule {}
