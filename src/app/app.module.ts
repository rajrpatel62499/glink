import { APP_INITIALIZER, NgModule } from '@angular/core';
import { FuseProgressBarModule, FuseSidebarModule, FuseThemeOptionsModule } from '@fuse/components';
import { RouterModule, Routes } from '@angular/router';

import { AppComponent } from 'app/app.component';
import { AppRoutePaths } from 'core/constants';
import { AppStoreModule } from 'app/store/store.module';
import { AuthGuardService } from 'core/authentication/auth.guard';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule } from '@angular/platform-browser';
import { ConfigService } from './store/services/config.service';
import { FakeDbService } from 'app/fake-db/fake-db.service';
import { FuseModule } from '@fuse/fuse.module';
import { FuseSharedModule } from '@fuse/shared.module';
import { HttpClientModule } from '@angular/common/http';
import { InMemoryWebApiModule } from 'angular-in-memory-web-api';
import { LayoutModule } from 'app/layout/layout.module';
import { Login2Component } from './main/pages/authentication/login-2/login-2.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMomentDateModule } from '@angular/material-moment-adapter';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslateModule } from '@ngx-translate/core';
import { constants } from 'buffer';
import { fuseConfig } from 'app/fuse-config';
import { GooglePlaceModule } from 'ngx-google-places-autocomplete';

export const configFactory = (configService: ConfigService) => {
  return () => configService.loadConfig();
};

const appRoutes: Routes = [
  // {
  //   path: '',
  //   loadChildren: () => import('./main/apps/apps.module').then((m) => m.AppsModule),
  //   canActivate: [AuthGuardService],
  // },
  {
    path: 'apps',
    loadChildren: () => import('./main/apps/apps.module').then((m) => m.AppsModule),
    canActivate: [AuthGuardService],
  },
  // {
  //   path: 'scrumboard',
  //   loadChildren: () =>
  //     import('./main/apps/scrumboard/scrumboard.module').then((m) => m.ScrumboardModule),
  // },
  {
    path: 'pages/auth/login-2',
    component: Login2Component,
  },
  {
    path: 'pages',
    loadChildren: () => import('./main/pages/pages.module').then((m) => m.PagesModule),
    canActivate: [AuthGuardService],
  },
  {
    path: 'ui',
    loadChildren: () => import('./main/ui/ui.module').then((m) => m.UIModule),
    canActivate: [AuthGuardService],
  },
  {
    path: 'documentation',
    loadChildren: () =>
      import('./main/documentation/documentation.module').then((m) => m.DocumentationModule),
    canActivate: [AuthGuardService],
  },
  {
    path: '',
    redirectTo: `${AppRoutePaths.Landing}`,
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: 'pages/auth/login-2',
  },
];

@NgModule({
  declarations: [AppComponent],
  imports: [
    GooglePlaceModule,
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    RouterModule.forRoot(appRoutes, { relativeLinkResolution: 'legacy' }),

    TranslateModule.forRoot(),
    InMemoryWebApiModule.forRoot(FakeDbService, {
      delay: 0,
      passThruUnknownUrl: true,
    }),

    // Material moment date module
    MatMomentDateModule,

    // Material
    MatButtonModule,
    MatIconModule,

    // Fuse modules
    FuseModule.forRoot(fuseConfig),
    FuseProgressBarModule,
    FuseSharedModule,
    FuseSidebarModule,
    FuseThemeOptionsModule,

    // App modules
    LayoutModule,
    AppStoreModule,
  ],
  bootstrap: [AppComponent],
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: configFactory,
      deps: [ConfigService],
      multi: true,
    },
  ],
})
export class AppModule {}
