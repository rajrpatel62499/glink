import { NgModule } from '@angular/core';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatRippleModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule, Routes } from '@angular/router';
import { FuseConfirmDialogModule, FuseMaterialColorPickerModule } from '@fuse/components';
import { FuseSharedModule } from '@fuse/shared.module';
import { NgxDnDModule } from '@swimlane/ngx-dnd';
import { CustomComponentsModule } from 'app/main/ui/custom/custom.module';
import { ScheduleService } from '../schedule/figma.service';
import { FigmaComponent } from './figma.component';
import { TaskService } from './figma.service';
import { FigmaLeftDrawerComponent } from './sidenavs/left/left-drawer/left-drawer.component';
import { FigmaLeftComponent } from './sidenavs/left/left.component';
import { FigmasComponent } from './sidenavs/left/list/figmas.component';
import { FigmaDetailComponent } from './sidenavs/right/detail/detail.component';
import { FigmaRightDrawerComponent } from './sidenavs/right/right-drawer/right-drawer.component';
import { FigmaRightComponent } from './sidenavs/right/right.component';
import { FigmaStartComponent } from './sidenavs/right/start/start.component';
const routes: Routes = [
  {
    path: 'all',
    component: FigmaComponent,
    resolve: {
      banner: TaskService,
    },
  },
  {
    path: 'location',
    component: FigmaComponent,
    resolve: {
      banner: TaskService,
    },
  },
  {
    path: ':id',
    component: FigmaComponent,
    resolve: {
      banner: TaskService,
    },
  },
  {
    path: '**',
    redirectTo: 'all',
  },
];

@NgModule({
  declarations: [
    FigmaComponent,
    FigmaDetailComponent,
    FigmaStartComponent,
    FigmasComponent,
    FigmaLeftComponent,
    FigmaRightComponent,
    FigmaLeftDrawerComponent,
    FigmaRightDrawerComponent,
    FigmaStartComponent,
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
    MatButtonModule,
    MatCheckboxModule,
    MatChipsModule,
    MatDatepickerModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
    MatProgressBarModule,
    MatRippleModule,
    MatSidenavModule,
    MatToolbarModule,
    MatTooltipModule,
    MatAutocompleteModule,
    MatSlideToggleModule,

    NgxDnDModule,

    FuseSharedModule,
    FuseConfirmDialogModule,
    FuseMaterialColorPickerModule,
    MatSelectModule,
    MatSnackBarModule,

    FuseSharedModule,
    CustomComponentsModule,
  ],
  providers: [TaskService, ScheduleService],
})
export class FigmaTaskModule {}
