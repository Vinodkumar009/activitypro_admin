import { Injectable } from '@angular/core';
import { Events, ToastController, LoadingController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from "rxjs/Rx";
import { CommonService, ToastMessageType } from './common.service';
import { environment as devEnvironment } from '../environments/environment';
import { environment as prodEnvironment } from '../environments/environment.prod';
@Injectable()
export class HttpService {
    offline_message: string;
    private env_const;
    constructor(
        public events: Events,
        public storage: Storage,
        private _http: HttpClient,
        public toastCtrl: ToastController,
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
    
      get<T>(api_method: string, params?: any,input_headers?:HttpHeaders,type:number = 1): Observable<T> {
        const headers = this.getDefaultHeaders();
        const url = type === 1 ? this.env_const.new_http_url:this.env_const.nest_url;
        return this._http.get<T>(`${url}/${api_method}`, { headers, params });
        // if (navigator.onLine) {
        //     const headers = this.getDefaultHeaders();
        //     const url = type === 1 ? this.env_const.new_http_url:this.env_const.nest_url;
        //     return this._http.get<T>(`${url}/${api_method}`, { headers, params });
        // }else{
        //     this.commonService.toastMessage(this.offline_message,2500,ToastMessageType.Error);
        //     return Observable.throw('offline');
        // }
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
    
      post<T>(api_method: string, data: any,input_headers?:HttpHeaders,type:number = 1): Observable<T> {
        const headers = this.getDefaultHeaders();
        const url = this.getApiUrlEndPoint(type);//type === 1 ? this.env_const.new_http_url:this.env_const.nest_url;
        return this._http.post<T>(`${url}/${api_method}`, data, { headers });
        // if (navigator.onLine) {
        //     const headers = this.getDefaultHeaders();
        //     const url = type === 1 ? this.env_const.new_http_url:this.env_const.nest_url;
        //     return this._http.post<T>(`${url}/${api_method}`, data, { headers });
        // }else{
        //     this.commonService.toastMessage(this.offline_message,2500,ToastMessageType.Error);
        //     return Observable.throw('offline');
        // }
      }
    
      put<T>(api_method: string, data: any,input_headers?:HttpHeaders,type:number = 1): Observable<T> {
        const url = type === 1 ? this.env_const.new_http_url:this.env_const.nest_url;
        const headers = input_headers ? input_headers : this.getDefaultHeaders();
        return this._http.put<T>(`${url}/${api_method}`, data, { headers });
        // if (navigator.onLine) {
        //     const url = type === 1 ? this.env_const.new_http_url:this.env_const.nest_url;
        //     const headers = input_headers ? input_headers : this.getDefaultHeaders();
        //     return this._http.put<T>(`${url}/${api_method}`, data, { headers });
        // }else{
        //     this.commonService.toastMessage(this.offline_message, 2500,ToastMessageType.Error);
        //     return Observable.throw('offline');
        // }
      }
    
      delete<T>(api_method: string,type:number = 1): Observable<T> {
        const headers = this.getDefaultHeaders();
        const url = type === 1 ? this.env_const.new_http_url:this.env_const.nest_url;
        return this._http.delete<T>(`${url}/${api_method}`, { headers });
        // if (navigator.onLine) {
        //     const headers = this.getDefaultHeaders();
        //     const url = type === 1 ? this.env_const.new_http_url:this.env_const.nest_url;
        //     return this._http.delete<T>(`${url}/${api_method}`, { headers });
        // }else{
        //     this.commonService.toastMessage(this.offline_message,2500,ToastMessageType.Error);
        //     return Observable.throw('offline');
        // }
      }

    

    





}