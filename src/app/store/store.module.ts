import { NgModule } from '@angular/core';
import { AppStates, CustomSerializer, effects, reducers } from 'app/store';
import { MetaReducer, StoreModule } from '@ngrx/store';
import { NgxsStoragePluginModule, StorageOption } from '@ngxs/storage-plugin';

// import { EffectsModule } from '@ngrx/effects';
// import { StoreDevtoolsModule } from '@ngrx/store-devtools';
// import { RouterStateSerializer, StoreRouterConnectingModule } from '@ngrx/router-store';
// import { UserState } from "./user/user.state";
import { environment } from 'environments/environment';
import { storeFreeze } from 'ngrx-store-freeze';
import { NgxsDispatchPluginModule } from '@ngxs-labs/dispatch-decorator';


import { NgxsActionsExecutingModule } from '@ngxs-labs/actions-executing';
import { NgxsModule } from '@ngxs/store';
import { NgxsSelectSnapshotModule } from '@ngxs-labs/select-snapshot';
import { NgxsReduxDevtoolsPluginModule } from '@ngxs/devtools-plugin';
import { NgxsLoggerPluginModule } from '@ngxs/logger-plugin';
import { NgxsRouterPluginModule, RouterStateSerializer } from '@ngxs/router-plugin';
import { CustomRouterStateSerializer } from './states/router/router-state.serializer';


export const metaReducers: MetaReducer<any>[] = !environment.production ? [storeFreeze] : [];

@NgModule({
  imports: [
    // StoreModule.forRoot(reducers, { metaReducers }),
    // EffectsModule.forRoot(effects),
    // !environment.production ? StoreDevtoolsModule.instrument() : [],
    // StoreRouterConnectingModule.forRoot(),
    
    NgxsActionsExecutingModule.forRoot(),
    NgxsSelectSnapshotModule.forRoot(),
    NgxsDispatchPluginModule.forRoot(),
    NgxsRouterPluginModule.forRoot(),
    NgxsStoragePluginModule.forRoot(),
    NgxsLoggerPluginModule.forRoot({
      disabled: true
    }),
    NgxsReduxDevtoolsPluginModule.forRoot({
      disabled: environment.production
    }),
    NgxsModule.forRoot(AppStates, {
        developmentMode: !environment.production,
    }),
  ],
  providers: [
        // NgxsReduxDevtoolsPluginModule.forRoot({
    //   disabled: environment.production
    // }),
    // NgxsResetPluginModule.forRoot(),
    // NgxsLoggerPluginModule.forRoot({
    //   disabled: environment.production
    // })
    { provide: RouterStateSerializer, useClass: CustomRouterStateSerializer },
  ],
  exports: [
    NgxsModule, 
    NgxsActionsExecutingModule,
    NgxsSelectSnapshotModule,
    NgxsDispatchPluginModule,
    NgxsRouterPluginModule,
    NgxsStoragePluginModule,
    NgxsLoggerPluginModule,
    NgxsReduxDevtoolsPluginModule
  ],
})
export class AppStoreModule {}
