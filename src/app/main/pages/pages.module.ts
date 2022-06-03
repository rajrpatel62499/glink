import { ComingSoonModule } from 'app/main/pages/coming-soon/coming-soon.module';
import { PrivacyAgreementModule } from './privacy-agreement/privacy-agreement.module';
import { Error404Module } from 'app/main/pages/errors/404/error-404.module';
import { Error500Module } from 'app/main/pages/errors/500/error-500.module';
import { FaqModule } from 'app/main/pages/faq/faq.module';
import { ForgotPassword2Module } from 'app/main/pages/authentication/forgot-password-2/forgot-password-2.module';
import { ForgotPasswordModule } from 'app/main/pages/authentication/forgot-password/forgot-password.module';
import { InvoiceCompactModule } from 'app/main/pages/invoices/compact/compact.module';
import { InvoiceModernModule } from 'app/main/pages/invoices/modern/modern.module';
import { KnowledgeBaseModule } from 'app/main/pages/knowledge-base/knowledge-base.module';
import { LockModule } from 'app/main/pages/authentication/lock/lock.module';
import { Login2Module } from 'app/main/pages/authentication/login-2/login-2.module';
import { LoginModule } from 'app/main/pages/authentication/login/login.module';
import { MailConfirmModule } from 'app/main/pages/authentication/mail-confirm/mail-confirm.module';
import { MaintenanceModule } from 'app/main/pages/maintenance/maintenence.module';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NgModule } from '@angular/core';
import { PricingModule } from 'app/main/pages/pricing/pricing.module';
import { ProfileModule } from 'app/main/pages/profile/profile.module';
import { Register2Module } from 'app/main/pages/authentication/register-2/register-2.module';
import { RegisterModule } from 'app/main/pages/authentication/register/register.module';
import { ResetPassword2Module } from 'app/main/pages/authentication/reset-password-2/reset-password-2.module';
import { ResetPasswordModule } from 'app/main/pages/authentication/reset-password/reset-password.module';
import { SearchClassicModule } from 'app/main/pages/search/classic/search-classic.module';
import { SearchModernModule } from 'app/main/pages/search/modern/search-modern.module';
import { CreatesModule } from './creates/creates.module';
import { CustomComponentsModule } from '../ui/custom/custom.module';
import { PrivacyAgreementSettingModule } from './privacy-agreement-setting/privacy-agreement-setting.module.module';

@NgModule({
  imports: [
    // Authentication
    LoginModule,
    Login2Module,
    RegisterModule,
    Register2Module,
    ForgotPasswordModule,
    ForgotPassword2Module,
    ResetPasswordModule,
    ResetPassword2Module,
    LockModule,
    MailConfirmModule,

    // Coming-soon
    ComingSoonModule,

    PrivacyAgreementModule,
    CustomComponentsModule,
    PrivacyAgreementSettingModule,

    // Errors
    Error404Module,
    Error500Module,

    // Invoices
    InvoiceModernModule,
    InvoiceCompactModule,

    // Maintenance
    MaintenanceModule,

    // Pricing
    PricingModule,

    // Profile
    ProfileModule,

    // Search
    SearchClassicModule,
    SearchModernModule,

    // Faq
    FaqModule,

    // Knowledge base
    KnowledgeBaseModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,

    // E-commerce
    CreatesModule
  ],
  declarations: [],
})
export class PagesModule {}
