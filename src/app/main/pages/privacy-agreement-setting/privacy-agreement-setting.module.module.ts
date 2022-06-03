import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { PrivacyAgreementSettingComponent } from './privacy-agreement-setting.component';

import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

import { FuseSharedModule } from '@fuse/shared.module';
import { FuseCountdownModule } from '@fuse/components';

import { CustomComponentsModule } from 'app/main/ui/custom/custom.module';
const routes = [
  {
    path: 'privacy-agreement-setting',
    component: PrivacyAgreementSettingComponent,
  },
];

@NgModule({
  declarations: [PrivacyAgreementSettingComponent],
  imports: [
    RouterModule.forChild(routes),

    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    CustomComponentsModule,

    FuseSharedModule,
    FuseCountdownModule,
  ],
})
export class PrivacyAgreementSettingModule {}
