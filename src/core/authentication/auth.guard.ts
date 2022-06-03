import {
    ActivatedRouteSnapshot,
    CanActivate,
    Router,
    RouterStateSnapshot,
} from "@angular/router";
import { Select, Store } from "@ngxs/store";

import { AppRoutePaths } from "core/constants";
import { AuthenticationService } from "app/store/services/authentication.service";
import { GetUserById } from "app/store/states/user/user.actions";
// import { GetUser } from "app/store/user/user.actions";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { UserState } from "app/store/states/user/user.state";

// import { User } from "app/store/user/user.model";
// import { UserService } from "app/store/user/user.service";

@Injectable({
    providedIn: "root",
})
export class AuthGuardService implements CanActivate {
    // @Select(UserState.User)
    // user$: Observable<User>;

    @Select(UserState.IsAuthenticated)
    isAuthenticated$: Observable<boolean>;
    isAuthenticated: boolean;

    constructor(private _router: Router, private _store: Store, private _authenticationService: AuthenticationService) {}

    canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): Observable<boolean> {
        //check some condition
        const loggedInUserToken = localStorage.getItem("loggedInUserToken");
        const loggedInUserId = localStorage.getItem("loggedInUserId");

        if (!loggedInUserToken) {
            this._router.navigate([AppRoutePaths.Login], {});
        }
        
        this._authenticationService.getUserProfile(loggedInUserId).toPromise().then(user => {
            this._store.dispatch(new GetUserById(user, null));
        }).catch(error => {
            this._store.dispatch(new GetUserById(null, error));
            this._router.navigate(['/pages/auth/login-2']);
        });
        return new Observable((s) => s.next(true));
    }
}
