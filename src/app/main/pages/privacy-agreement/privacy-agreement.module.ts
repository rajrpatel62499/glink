import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

import { FuseSharedModule } from '@fuse/shared.module';
import { FuseCountdownModule } from '@fuse/components';

import { PrivacyAgreementComponent } from './privacy-agreement.component';
import { CustomComponentsModule } from 'app/main/ui/custom/custom.module';


const routes = [
  {
    path: 'privacy-agreement',
    component: PrivacyAgreementComponent,
  },
];

@NgModule({
  declarations: [PrivacyAgreementComponent],
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
export class PrivacyAgreementModule {}
