// import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { throwError, BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
    providedIn: 'root'
})
export class HttpErrorHandler {
    constructor(
        private router: Router
    ) { }

    fixedMessage = new BehaviorSubject<any>(null);

    //TODO: need to update this
    async handleError(serviceName = '', error: HttpErrorResponse, endpoint = 'operation') {
        const errorMessage = error.error.message;
        switch (error.status) {
            case 400:
                return throwError(error);
            case 401:
                localStorage.clear();
                this.router.navigate(['/auth']);
                return;
            case 403:
                return throwError(error);
            case 404:
                return throwError(error);
            case 500:
                return throwError(error);
            default:
        }

        return throwError(error);
    }
}
