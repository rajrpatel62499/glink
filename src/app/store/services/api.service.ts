import { FuseProgressBarService } from '@fuse/components/progress-bar/progress-bar.service';
import { UtilService } from './util.service';
import { tap } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { HttpErrorHandler } from './http-error-handler.service';
import { ConfigService } from './config.service';
import { Configs } from 'core/constants';
import { CallState, ApiCallStateModel } from '../states/api-call/api-call-state.model';
import { ApiCallDispatchers } from '../states/api-call/api-call.dispatchers';
import { constants } from '../constants/store-constants';
import { from, Observable } from 'rxjs';

/**
 * api should handle
 * - set the loader & error info based on the api is being called. 
 */
@Injectable({
    providedIn: 'root'
})

export class ApiService {
    get backend_url() {
        return `${this._configService.config.baseURL}`;
    }

    constructor(
        private http: HttpClient,
        private httpErrorHandler: HttpErrorHandler,
        private _configService: ConfigService,
        private util: UtilService,
        private _fuseProgressBarService: FuseProgressBarService
        ) { }

    async getHeaders({tokenRequired, formData}) {
        const token: any = localStorage.getItem("loggedInUserToken");;
        let headers = new HttpHeaders();
        
        if (!formData)
            headers = headers.set('Content-Type', 'application/json');
        
        if (!token) return headers;

        if (tokenRequired)
            headers = headers.set('Authorization', `${token}`)

        return headers;
    }

    // this function should be used for fetch details without header token
    async get({ url, paramsObj = {},  progress = false, callState = '', authorize = true  }): Promise<any> {
        const params = this.util.getParamsFromObj(paramsObj);
        const netowrkIsConnected = await this.getNetworkConnection();

        const headers = await this.getHeaders({ tokenRequired: authorize, formData: false});
        const endpoint = `${this.backend_url}${url}`;

        const options = {
            headers,
            params
        }

        const promise = new Promise(async (resolve, reject) => {
            this.init(callState);
            progress ? this.progressBar(true) : '';

            const success = (res) => {
                // you can stop the loader or show success message or toaster.
                resolve(res);
                this.success(callState, res);
                this.progressBar(false);
            };
            const error = (err) => {
                reject(err);
                this.error(callState, err);
                this.progressBar(false);
                this.httpErrorHandler.handleError(url, err);
            };

            if (netowrkIsConnected) {
                return this.http.get(endpoint, options).subscribe(success, error);
            } else {
                // you can stop the loaders here & show the toast message or internet conneciton loose popup.
                // this.toastr.error(constants.NO_INTERNET_CONNECTION_MSG);
                this.error(callState, constants.NO_INTERNET_CONNECTION_MSG);
                this.progressBar(false);
                return null;
            }
        });

        return promise;
    }

    // this function should be used for post details without header token
    async post({ url, payload, progress = false, callState = '', authorize = true}) {
             
        const headers = await this.getHeaders({ tokenRequired: authorize, formData: false});
        const netowrkIsConnected = await this.getNetworkConnection();
        const endpoint = `${this.backend_url}${url}`;

        return new Promise(async (resolve,reject) => {
            this.init(callState);
            progress ? this.progressBar(true) : '';

            const success = (res) => {
                // you can stop the loader or show success message or toaster.
                resolve(res);
                this.success(callState, res);
                this.progressBar(false);
            };
            const error = (err) => { 
                reject(err);                 
                this.error(callState, err);
                this.progressBar(false);
                this.httpErrorHandler.handleError(url, err);
            };

            if (netowrkIsConnected) {
                return this.http.post<any>(endpoint, payload, { headers }).subscribe(success, error);
            } else {
                // you can stop the loaders here & show the toast message or internet conneciton loose popup.
                this.error(callState, constants.NO_INTERNET_CONNECTION_MSG);
                // this.toastr.error(constants.NO_INTERNET_CONNECTION_MSG);
                this.progressBar(false);
                return null;
            }
        });
    }
    
    async put({ url, payload, progress = false , callState = '', authorize = true}) {
     
        const headers = await this.getHeaders({ tokenRequired: authorize, formData: false});
        const netowrkIsConnected = await this.getNetworkConnection();
        const endpoint = `${this.backend_url}${url}`;
        
        return new Promise(async (resolve,reject) => {
            this.init(callState);
            progress ? this.progressBar(true) : '';

            const success = (res) => {
                // you can stop the loader or show success message or toaster.
                resolve(res);
                this.success(callState, res);
                this.progressBar(false);
            };

            const error = (err) => { 
                reject(err);                           
                this.error(callState, err);
                this.progressBar(false);
                this.httpErrorHandler.handleError(url, err);
            };
            
            if (netowrkIsConnected) {
                return this.http.put<any>(endpoint, payload, { headers }).subscribe(success, error);
            } else {
                // you can stop the loaders here & show the toast message or internet conneciton loose popup.
                this.error(callState, constants.NO_INTERNET_CONNECTION_MSG);

                this.progressBar(false);
                // this.toastr.error(constants.NO_INTERNET_CONNECTION_MSG);
                return null;
            }
        })
       
    }

    async patch({ url, payload, authorize = true}) {
        return new Promise(async (resolve,reject) => {
            const success = (res) => {
                // you can stop the loader or show success message or toaster.
                resolve(res);
            };
            const error = (err) => { 
                reject(err);                           
                this.httpErrorHandler.handleError(url, err);
            };
            const netowrkIsConnected = await this.getNetworkConnection();
            if (netowrkIsConnected) {
                const headers = await this.getHeaders({ tokenRequired: authorize, formData: false});
                return this.http.put<any>(`${this.backend_url}${url}`, payload, { headers })
                    .subscribe(success, error);
            } else {
                // you can stop the loaders here & show the toast message or internet conneciton loose popup.
                // this.toastr.error(constants.NO_INTERNET_CONNECTION_MSG);
                return null;
            }
        });
    }


    async delete(url: any, authorize) {
        return new Promise(async (resolve, _) => {
            const success = (res) => {
                // you can stop the loader or show success message or toaster.
                resolve(res);
            };
            const error = (err) => {
                return this.httpErrorHandler.handleError(url, err);
            };
            const netowrkIsConnected = await this.getNetworkConnection();
            if (netowrkIsConnected) {
                const headers = await this.getHeaders({ tokenRequired: authorize, formData: false});
                return this.http.delete(`${this.backend_url}${url}`, { headers })
                    .subscribe(success, error);
            } else {
                // this.ngxLoader.stop();
                // this.toastr.error(constants.NO_INTERNET_CONNECTION_MSG);
                return null;
            }
        });
    }



    async postExportData(url: any, obj: any) {
        return new Promise(async (resolve, _) => {
            const success = (res) => {
                if (res && res.msg) {
                    // this.toastr.success(res.msg);
                }
                // this.ngxLoader.stop();
                resolve(res);
            };
            const error = (err) => {
                return this.httpErrorHandler.handleError(url, err);
            };
            const options = {
                headers: await this.getHeaders({ tokenRequired: true, formData: false}),
                responseType: 'text' as 'json'
            };
            return this.http.post<any>(this.backend_url + url, obj, options)
                .subscribe(success, error);
        });
    }


    getNetworkConnection() {
        const isOnline: boolean = navigator.onLine;
        if (isOnline) {
            return true;
        }
        return false;
    }

    async uploadFileWithProgress(path: any, obj: any) {
        const netowrkIsConnected = await this.getNetworkConnection();
        if (netowrkIsConnected) {
            const headers = await this.getHeaders({ tokenRequired: true, formData: false});
            return this.http.post<any>(`${this.backend_url}${path}`, obj, {
                headers, reportProgress: true,
                observe: 'events'
            });
        } else {
            // this.ngxLoader.stop();
            // this.toastr.error(constants.NO_INTERNET_CONNECTION_MSG);
            return null;
        }
    }


    async getFile(url: any) {
        return new Promise(async (resolve, _) => {
            const success = (res) => {
                // toaster success message
                if (res && res.message) {
                    // this.toastr.success(res.message);
                }
                resolve(res);
            };
            const error = (err) => {
                return this.httpErrorHandler.handleError(url, err);
            };
            const netowrkIsConnected = await this.getNetworkConnection();
            if (netowrkIsConnected) {
                return this.http.get(url, { responseType: 'blob' })
                    .subscribe(success, error);
            } else {
                // this.ngxLoader.stop();
                // this.toastr.error(constants.NO_INTERNET_CONNECTION_MSG);
                return null;
            }
        });
    }



    private progressBar(show: boolean) {
        if (show) {
            this._fuseProgressBarService.show();
        } else {
            this._fuseProgressBarService.hide();
        }
    }

    private init(callState: string) {
        this.changeCallState(callState,{ loading: true, success: false, error: null, response: {} });
    }

    private success(callState: string, res) {
        this.changeCallState(callState,{ success: true, loading: false , response: res, error: null});

    }

    private error(callState: string, err) {
        this.changeCallState(callState,{ error: err, success: false, loading: false, response: {} });
    }

    private changeCallState(callStateName,data: CallState) {
        const callStateObj: Partial<ApiCallStateModel> = {};

        callStateObj[callStateName] = data;

        if (data.loading) {
            ApiCallDispatchers.apiCallLoading(callStateObj);
        } else if(!data.loading && !data.error){
            ApiCallDispatchers.apiCallLoaded(callStateObj);
        } else if (!data.loading && data.error) {
            ApiCallDispatchers.apiCallError(callStateObj);
        } else {
            ApiCallDispatchers.apiCallStateChange(callStateObj);
        }

    }

}
