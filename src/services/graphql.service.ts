import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { ApolloQueryResult,MutationOptions,QueryOptions } from 'apollo-client';
import { FetchResult } from 'apollo-link';
import { Observable } from 'rxjs';
//import { ApolloQueryResult, FetchResult } from '@apollo/client/core';
//import { FetchResult } from 'apollo-link';
import { environment as devEnvironment } from '../environments/environment';
import { environment as prodEnvironment } from '../environments/environment.prod';
import { CommonService, ToastMessageType } from './common.service';
@Injectable()
export class GraphqlService {
  offline_message: string;
  loading: any;
  safeImage: any;
  private baseUrl:string;
  private env_const;
  constructor(private apollo: Apollo,private commonService: CommonService,) {
    this.env_const = prodEnvironment.production ? prodEnvironment:devEnvironment;
    this.offline_message = "You are OFFLINE. Please check your network connection!";
    this.baseUrl = this.env_const.nest_url;
  }

  
  


  query(input_query: any, input_variables?: any,endpoint_type:number = 1):  Observable<ApolloQueryResult<any>> {
  //query<T>(query: any, variables?: any): Observable<any> {
    const options: QueryOptions = {
      query: input_query,
      variables: input_variables,
      fetchPolicy: 'no-cache',
    };

    // Set the uri property dynamically
    options.context = {
      uri: endpoint_type === 1 ? this.env_const.graphql_url:this.env_const.new_graphql_url,
    };

    // if (navigator.onLine) {
    //   return this.apollo.query(options);
    // }else{
    //   this.commonService.toastMessage(this.offline_message,4000,ToastMessageType.Error);
    //   return Observable.throw('offline');
    // }
    return this.apollo.query(options);
 
  }

  mutate<T>(mutation: any, variables?: any,endpoint_type:number = 1 ): Observable<any> {
    const options: MutationOptions = {
      mutation: mutation,
      variables: variables,
    };

    // Set the uri property dynamically
    options.context = {
      uri: endpoint_type  === 1 ? this.env_const.graphql_url:this.env_const.new_graphql_url,
    };

    // if (navigator.onLine) {
    //   return this.apollo.mutate(options);
    // }else{
    //   this.commonService.toastMessage(this.offline_message,4000, ToastMessageType.Error);
    //   return Observable.throw('offline');
    // }
    return this.apollo.mutate(options);
    
  }


}