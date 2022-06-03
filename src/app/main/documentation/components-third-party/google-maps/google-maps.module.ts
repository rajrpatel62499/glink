import { AgmCoreModule } from '@agm/core';
import { DocsComponentsThirdPartyGoogleMapsComponent } from './google-maps.component';
import { FuseHighlightModule } from '@fuse/components/index';
import { FuseSharedModule } from '@fuse/shared.module';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

const routes = [
  {
    path: 'google-maps',
    component: DocsComponentsThirdPartyGoogleMapsComponent,
  },
];

@NgModule({
  declarations: [DocsComponentsThirdPartyGoogleMapsComponent],
  imports: [
    RouterModule.forChild(routes),

    MatButtonModule,
    MatIconModule,

    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyD9N_Hihkl14tnb4dq3zk2fyxifEbe7ZBI',
    }),

    FuseSharedModule,
    FuseHighlightModule,
  ],
})
export class GoogleMapsModule {}
