import { Component, OnInit, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AppRoutePaths } from 'core/constants';
import { UserState } from 'app/store/states/user/user.state';
import { DOCUMENT } from '@angular/common';
import { Select, Store } from '@ngxs/store';
import { User } from 'app/main/apps/user/user.model';
import { Observable, Subject } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { UserService } from 'app/main/apps/user/figma.service';

@Component({
  selector: 'app-figma-privacy-agreement-button',
  templateUrl: './figma-privacy-agreement-button.component.html',
  styleUrls: ['./figma-privacy-agreement-button.component.scss'],
})
export class FigmaPrivacyAgreementButtonComponent implements OnInit {
  @Select(UserState.User)
  user$: Observable<User>;
  user: User = null;

  privacyAgreementForm: FormGroup;

  private _unsubscribeAll: Subject<any>;

  /**
   * Constructor
   *
   * @param {FormBuilder} _formBuilder
   */
  constructor(
    private _userService: UserService,
    private _formBuilder: FormBuilder,
    private _router: Router,
    private _store: Store,
    private _matSnackBar: MatSnackBar,
    public translate: TranslateService,
    @Inject(DOCUMENT) private _document: Document
  ) {
    this._unsubscribeAll = new Subject();
  }

  ngOnInit(): void {
    this.privacyAgreementForm = this._formBuilder.group({});
    this.user$.subscribe((item) => {
      if (!!item) {
        this.user = item;
      }
    });
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }

  accept(): void {
    if (!!!this.user || !!!this.user._id) {
      this.showPopup(this.translate.instant('COMMON.MISSING_USER_ID'));
      return;
    }

    let payload: any = {
      id: this.user._id,
      eula: true,
    };

    this._userService
      .updateEula(payload)
      .then((response) => {
        if (!!response && !!response.eula && response.eula != '') {
          this._router.navigate([AppRoutePaths.Landing]);
          return;
        }
        this.showPopup(this.translate.instant('COMMON.UPDATE_USER_EULA_FAILED'));
      })
      .catch((error) => {
        this.showPopup(this.translate.instant('COMMON.UPDATE_USER_FAILED'));
      });
  }

  showPopup(message: string) {
    this._matSnackBar.open(message, this.translate.instant('COMMON.DISMISS'), {
      verticalPosition: 'top',
      duration: 2000,
    });
  }

  decline(): void {
    localStorage.clear();
    this._store.reset(UserState);
    this._router.navigate(['/pages/auth/login-2']);
  }
}
