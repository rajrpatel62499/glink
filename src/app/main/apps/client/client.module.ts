import { NgModule } from '@angular/core';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
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
import { ScrumboardBoardAddListComponent } from 'app/main/apps/client/banner/add-list/add-list.component';
import { ScrumboardCardDialogComponent } from 'app/main/apps/client/banner/dialogs/card/card.component';
import { ScrumboardLabelSelectorComponent } from 'app/main/apps/client/banner/dialogs/card/label-selector/label-selector.component';
import { ScrumboardEditBoardNameComponent } from 'app/main/apps/client/banner/edit-board-name/edit-board-name.component';
import { ScrumboardBoardAddCardComponent } from 'app/main/apps/client/banner/list/add-card/add-card.component';
import { ScrumboardBoardCardComponent } from 'app/main/apps/client/banner/list/card/card.component';
import { ScrumboardBoardEditListNameComponent } from 'app/main/apps/client/banner/list/edit-list-name/edit-list-name.component';
import { ScrumboardBoardListComponent } from 'app/main/apps/client/banner/list/list.component';
import { ScrumboardBoardColorSelectorComponent } from 'app/main/apps/client/banner/sidenavs/settings/board-color-selector/board-color-selector.component';
import { ScrumboardBoardSettingsSidenavComponent } from 'app/main/apps/client/banner/sidenavs/settings/settings.component';
import { ClientComponent } from 'app/main/apps/client/client.component';
import { BoardResolve, ClientService } from 'app/main/apps/client/client.service';
import { BannerEditDialogComponent } from './banner/dialogs/card/banner-edit-dialog/banner-edit-dialog.component';
import { EmptyListItemComponent } from './banner/empty-list-item/empty-list-item.component';

const routes: Routes = [
  {
    path: 'banners',
    component: ClientComponent,
    resolve: {
      banner: ClientService,
    },
  },
  {
    path: '**',
    redirectTo: 'banners',
  },
];

@NgModule({
  declarations: [
    ClientComponent,
    ScrumboardBoardListComponent,
    ScrumboardBoardCardComponent,
    ScrumboardBoardEditListNameComponent,
    ScrumboardBoardAddCardComponent,
    ScrumboardBoardAddListComponent,
    ScrumboardCardDialogComponent,
    ScrumboardLabelSelectorComponent,
    ScrumboardEditBoardNameComponent,
    ScrumboardBoardSettingsSidenavComponent,
    ScrumboardBoardColorSelectorComponent,
    EmptyListItemComponent,
    BannerEditDialogComponent,
  ],
  imports: [
    RouterModule.forChild(routes),

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
  ],
  providers: [ClientService, BoardResolve],
  entryComponents: [ScrumboardCardDialogComponent],
})
export class ClientModule {}
