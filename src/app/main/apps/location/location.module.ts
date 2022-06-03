import { RouterModule, Routes } from '@angular/router';

import { FuseSharedModule } from '@fuse/shared.module';
import { FuseSidebarModule } from '@fuse/components';
import { LocationComponent } from 'app/main/apps/location/location.component';
import { LocationDetailsComponent } from 'app/main/apps/location/location-details/location-details.component';
import { LocationListComponent } from 'app/main/apps/location/location-list/location-list.component';
import { LocationListItemComponent } from 'app/main/apps/location/location-list/location-list-item/location-list-item.component';
import { LocationMainSidebarComponent } from './sidebars/main/location-main-sidebar.component';
import { LocationService } from 'app/main/apps/location/location.service';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatRippleModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { NgModule } from '@angular/core';
import { NgxDnDModule } from '@swimlane/ngx-dnd';

const routes: Routes = [
  {
    path: 'temp',
    component: LocationComponent,
    resolve: {
      location: LocationService,
    },
  },
  {
    path: 'all',
    component: LocationComponent,
    resolve: {
      location: LocationService,
    },
  },
  {
    path: 'all/:locationId',
    component: LocationComponent,
    resolve: {
      location: LocationService,
    },
  },
  {
    path: 'tag/:tagHandle',
    component: LocationComponent,
    resolve: {
      location: LocationService,
    },
  },
  {
    path: 'tag/:tagHandle/:locationId',
    component: LocationComponent,
    resolve: {
      location: LocationService,
    },
  },
  {
    path: 'filter/:filterHandle',
    component: LocationComponent,
    resolve: {
      location: LocationService,
    },
  },
  {
    path: 'filter/:filterHandle/:locationId',
    component: LocationComponent,
    resolve: {
      location: LocationService,
    },
  },
  {
    path: '**',
    redirectTo: 'all',
  },
];

@NgModule({
  declarations: [
    LocationComponent,
    LocationMainSidebarComponent,
    LocationListItemComponent,
    LocationListComponent,
    LocationDetailsComponent,
  ],
  imports: [
    RouterModule.forChild(routes),

    MatButtonModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatMenuModule,
    MatRippleModule,
    MatSelectModule,
    // new
    MatSlideToggleModule,
    MatChipsModule,

    NgxDnDModule,

    FuseSharedModule,
    FuseSidebarModule,
  ],
  providers: [LocationService],
})
export class LocationModule {}
