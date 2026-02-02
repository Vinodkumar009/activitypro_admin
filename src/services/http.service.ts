import { Injectable } from '@angular/core';
import { Events, ToastController, LoadingController, Loading } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable } from "rxjs/Rx";
import { catchError, finalize } from 'rxjs/operators';
import { CommonService, ToastMessageType, ToastPlacement } from './common.service';
import { environment as devEnvironment } from '../environments/environment';
import { environment as prodEnvironment } from '../environments/environment.prod';

export interface HttpOptions {
  showLoader?: boolean;
  loaderMessage?: string;
  showErrorToast?: boolean;
  customErrorMessage?: string;
}

@Injectable()
export class HttpService {
    offline_message: string;
    private env_const: any;
    private activeLoaders: Map<string, Loading> = new Map();
    
    constructor(
        public events: Events,
        public storage: Storage,
        private _http: HttpClient,
        public toastCtrl: ToastController,
        public loadingCtrl: LoadingController,
        private commonService: CommonService
        
    ) {
        this.env_const = prodEnvironment.production ? prodEnvironment:devEnvironment;
        this.offline_message = "You are OFFLINE. Please check your network connection!";
        
    }

    // get(url: string, options?: any): Observable<any> {
    //     if (navigator.onLine) {
    //         //options = this.prepareOptions(options);
    //         return Observable.create((observer) => {
    //             this._http.get(this.commonService.getApiServiceUrl() + url, options)
    //                 .map(response => <any>response)
    //                 .subscribe((res) => {
    //                     this.loading.dismiss().catch(() => { });
    //                     observer.next(res);
    //                 }, (error) => {
    //                     this.loading.dismiss().catch(() => { });
    //                     observer.error(error)
    //                 },
    //                 () => {
    //                         observer.complete()
    //                 });
    //         });
    //     }
    //     else {
    //         this.commonService.toastMessage(this.offline_message, 0);
    //         return Observable.throw('offline');
    //     }
    // }

    // post(url: string, model: any, options?: any): Observable<any> {
    //     if (navigator.onLine) {
    //         let body = model;
    //         //options = this.prepareOptions(options);
    //         return Observable.create((observer) => {
    //             this._http.post(this.commonService.getApiServiceUrl() + url, body, options)
    //                 .map(response => <any>response)
    //                 .subscribe((res) => {
    //                     this.loading.dismiss().catch(() => { });
    //                     observer.next(res);
    //                 }, (error) => {
    //                     observer.error(error)
    //                     this.loading.dismiss().catch(() => { });
    //                 },
    //                 () => {
    //                         observer.complete()
    //                 });
    //         });
    //     }   
                
    // }

    private getDefaultHeaders(): HttpHeaders {
        // Add any default headers you need for each request
        return new HttpHeaders({
          'Content-Type': 'application/json',
          // Add other headers as needed
        });
      }

      private async showLoader(loaderId: string, message: string = 'Please wait...') {
        if (!this.activeLoaders.has(loaderId)) {
          const loader = this.loadingCtrl.create({
            content: message,
            dismissOnPageChange: false
          });
          this.activeLoaders.set(loaderId, loader);
          await loader.present();
        }
      }

      private async hideLoader(loaderId: string) {
        const loader = this.activeLoaders.get(loaderId);
        if (loader) {
          try {
            await loader.dismiss();
          } catch (e) {
            // Loader already dismissed
          }
          this.activeLoaders.delete(loaderId);
        }
      }

      private handleError(error: HttpErrorResponse, customMessage?: string, showToast: boolean = true): Observable<any> {
        console.error('HTTP Error:', error);
        
        let errorMessage = customMessage || 'An error occurred';
        
        if (error.error && error.error.message) {
          errorMessage = error.error.message;
        } else if (error.message) {
          errorMessage = error.message;
        } else if (error.status === 0) {
          errorMessage = 'Network error. Please check your connection.';
        } else if (error.status === 404) {
          errorMessage = 'Resource not found.';
        } else if (error.status === 500) {
          errorMessage = 'Server error. Please try again later.';
        } else if (error.status === 401) {
          errorMessage = 'Unauthorized. Please login again.';
        } else if (error.status === 403) {
          errorMessage = 'Access forbidden.';
        }
        
        if (showToast) {
          this.commonService.toastMessage(
            errorMessage, 
            2500, 
            ToastMessageType.Error, 
            ToastPlacement.Bottom
          );
        }
        
        error['errorMessage'] = errorMessage;
        return Observable.throw(error);
      }
    
      get<T>(api_method: string, params?: any, input_headers?: HttpHeaders, type: number = 1, options?: HttpOptions): Observable<T> {
        const defaultOptions: HttpOptions = {
          showLoader: true,
          loaderMessage: 'Please wait...',
          showErrorToast: true,
          customErrorMessage: 'Failed to fetch data'
        };
        const opts = { ...defaultOptions, ...options };
        // const loaderId = `get_${Date.now()}_${Math.random()}`;
        
        // if (opts.showLoader) {
        //   this.showLoader(loaderId, opts.loaderMessage);
        // }
        
        const headers = input_headers || this.getDefaultHeaders();
        const url = type === 1 ? this.env_const.new_http_url : this.env_const.nest_url;
        
        return this._http.get<T>(`${url}/${api_method}`, { headers, params })
          .pipe(
            catchError((error) => this.handleError(error, opts.customErrorMessage, opts.showErrorToast)),
            finalize(() => {
              if (opts.showLoader) {
                //this.hideLoader(loaderId);
              }
            })
          );
      }

      getApiUrlEndPoint(type:number = 1): string {
        switch(type) {
          case 1:
            return this.env_const.new_http_url;
          case 2:
            return this.env_const.nest_url;
          case 3:
            return this.env_const.apigateway_url1;
        }
      }
    
      post<T>(api_method: string, data: any, input_headers?: HttpHeaders, type: number = 1, options?: HttpOptions): Observable<T> {
        const defaultOptions: HttpOptions = {
          showLoader: true,
          loaderMessage: 'Please wait...',
          showErrorToast: true,
          customErrorMessage: 'Failed to save data'
        };
        const opts = { ...defaultOptions, ...options };
        // const loaderId = `post_${Date.now()}_${Math.random()}`;
        
        // if (opts.showLoader) {
        //   this.showLoader(loaderId, opts.loaderMessage);
        // }
        
        const headers = input_headers || this.getDefaultHeaders();
        const url = this.getApiUrlEndPoint(type);
        
        return this._http.post<T>(`${url}/${api_method}`, data, { headers })
          .pipe(
            catchError((error) => this.handleError(error, opts.customErrorMessage, opts.showErrorToast)),
            finalize(() => {
              // if (opts.showLoader) {
              //   this.hideLoader(loaderId);
              // }
            })
          );
      }
    
      put<T>(api_method: string, data: any, input_headers?: HttpHeaders, type: number = 1, options?: HttpOptions): Observable<T> {
        const defaultOptions: HttpOptions = {
          showLoader: true,
          loaderMessage: 'Please wait...',
          showErrorToast: true,
          customErrorMessage: 'Failed to update data'
        };
        const opts = { ...defaultOptions, ...options };
        const loaderId = `put_${Date.now()}_${Math.random()}`;
        
        if (opts.showLoader) {
          this.showLoader(loaderId, opts.loaderMessage);
        }
        
        const url = type === 1 ? this.env_const.new_http_url : this.env_const.nest_url;
        const headers = input_headers || this.getDefaultHeaders();
        
        return this._http.put<T>(`${url}/${api_method}`, data, { headers })
          .pipe(
            catchError((error) => this.handleError(error, opts.customErrorMessage, opts.showErrorToast)),
            finalize(() => {
              if (opts.showLoader) {
                this.hideLoader(loaderId);
              }
            })
          );
      }
    
      delete<T>(api_method: string, type: number = 1, options?: HttpOptions): Observable<T> {
        const defaultOptions: HttpOptions = {
          showLoader: true,
          loaderMessage: 'Please wait...',
          showErrorToast: true,
          customErrorMessage: 'Failed to delete data'
        };
        const opts = { ...defaultOptions, ...options };
        const loaderId = `delete_${Date.now()}_${Math.random()}`;
        
        if (opts.showLoader) {
          this.showLoader(loaderId, opts.loaderMessage);
        }
        
        const headers = this.getDefaultHeaders();
        const url = type === 1 ? this.env_const.new_http_url : this.env_const.nest_url;
        
        return this._http.delete<T>(`${url}/${api_method}`, { headers })
          .pipe(
            catchError((error) => this.handleError(error, opts.customErrorMessage, opts.showErrorToast)),
            finalize(() => {
              if (opts.showLoader) {
                this.hideLoader(loaderId);
              }
            })
          );
      }

    

    





}