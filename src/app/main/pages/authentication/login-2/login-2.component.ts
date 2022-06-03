import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Select, Store } from '@ngxs/store';
import { AppRoutePaths } from 'core/constants';
import { AuthenticateUser, GetUserById } from 'app/store/states/user/user.actions';
import { AuthenticationService } from 'app/store/services/authentication.service';
import { ConfigService } from 'app/store/services/config.service';
import { FuseConfigService } from '@fuse/services/config.service';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { User } from 'app/main/apps/user/user.model';
import { UserService } from 'app/main/apps/user/figma.service';
import { UserState } from 'app/store/states/user/user.state';
import { fuseAnimations } from '@fuse/animations';
import { skip } from 'rxjs/operators';
import { FeatureFlagService } from 'app/store/services/feature-flag.service';
@Component({
  selector: 'login-2',
  templateUrl: './login-2.component.html',
  styleUrls: ['./login-2.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations,
})
export class Login2Component implements OnInit {
  @Select(UserState.IsAuthenticated)
  isAuthenticated$: Observable<boolean>;
  isAuthenticated: boolean = false;

  @Select(UserState.Error)
  error$: Observable<any>;
  error: any = null;
  loginForm: FormGroup;
  loading: boolean = false;
  errorMessage: string = '';
  logoUrl = '';
  company = '';

  /**
   * Constructor
   *
   * @param {FuseConfigService} _fuseConfigService
   * @param {FormBuilder} _formBuilder
   */
  constructor(
    private _fuseConfigService: FuseConfigService,
    private _formBuilder: FormBuilder,
    private _authenticationService: AuthenticationService,
    private _configService: ConfigService,
    private _featureFlagService: FeatureFlagService,
    private _store: Store,
    private _router: Router
  ) {
    this.logoUrl = `https://g-link-media.s3.amazonaws.com/app-assets/portal/logos/${_configService.config.server}-small.png`;
    this.company = `${_configService.config.company}`;
    this._fuseConfigService.config = {
      layout: {
        navbar: {
          hidden: true,
        },
        toolbar: {
          hidden: true,
        },
        footer: {
          hidden: true,
        },
        sidepanel: {
          hidden: true,
        },
      },
    };
  }
  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------
  /**
   * On init
   */
  ngOnInit(): void {
    this.loginForm = this._formBuilder.group({
      username: ['', [Validators.required, Validators.minLength(4)]],
      password: ['', Validators.required, , Validators.minLength(4)],
    });

    this.isAuthenticated$.subscribe((flag) => {
      this.loading = false;

      if (!!flag) {
        const loggedInUserId = localStorage.getItem('loggedInUserId');
        this._authenticationService
          .getUserProfile(loggedInUserId)
          .toPromise()
          .then((user) => {
            if (!!user && user.id !== '') {
              this._featureFlagService.getAllFlags();
              
              if (user.eula === null) {
                this._router.navigate(['/pages/privacy-agreement']);
              } else {
                this._router.navigate([AppRoutePaths.Landing]);
              }
            }
          })
          .catch((error) => {
            this._router.navigate(['/pages/auth/login-2']);
          });
      }
    });

    this.error$.subscribe((err) => {
      if (!!err) {
        this.errorMessage = `${err.status}: ${err.statusText} - ${err.error.message}`;
      }
      this.loading = false;
    });
  }

  onClick() {
    this.loading = true;

    const username = this.loginForm.controls.username.value;
    const password = this.loginForm.controls.password.value;
    const payload = { username, password } as any;

    this._authenticationService
      .login(payload)
      .toPromise()
      .then((user) => {
        this._store.dispatch(new AuthenticateUser({ token: user.token, id: user.id }, null));
      })
      .catch((error) => {
        this._store.dispatch(new AuthenticateUser({}, error));
      });
  }

  ngOnDestroy(): void {}
}
