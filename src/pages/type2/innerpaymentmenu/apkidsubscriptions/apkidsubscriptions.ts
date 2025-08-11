import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { CommonService, ToastMessageType, ToastPlacement } from '../../../../services/common.service';
import { Storage } from '@ionic/storage';
import { Apollo, QueryRef } from 'apollo-angular';
import { HttpLink } from 'apollo-angular-link-http'
import gql from 'graphql-tag';
import * as moment from 'moment';
/**
 * Generated class for the ApkidsubscriptionsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-apkidsubscriptions',
  templateUrl: 'apkidsubscriptions.html',
})
export class Apkidsubscriptions {
  parentClubKey: string;
  Subscriptions:Subscriptions[];
  constructor(public navCtrl: NavController, public navParams: NavParams, private apollo: Apollo, private httpLink: HttpLink, public commonService: CommonService, public storage: Storage,) {
    storage.get('userObj').then((val) => {
      val = JSON.parse(val);
      if (val.$key != "") {
        this.parentClubKey = val.UserInfo[0].ParentClubKey;
        this.getSubscriptions();
      }
    })
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ApkidsubscriptionsPage');
  }

  //   //getting Templates
  getSubscriptions = () => {
    this.commonService.showLoader("Fetching subscriptions...");

    const subscriptionQuery = gql`
      query getSubscriptions($parentClub:String!) {
        getSubscriptions(parentClubKey:$parentClub){
          TotalApKidsLosingUser
          SubscriptionDetails{
            Amount
            Currency
            EnrolledOnLocal
            SetupOptions
            ChildKey
            ChildName
          }
        }
      }
    `;
    this.apollo
      .query({
        query: subscriptionQuery,
        variables: {
          parentClub: this.parentClubKey,
        },
      })
      .subscribe(({ data }) => {
        this.commonService.hideLoader();
        this.commonService.toastMessage("Subscriptions fetched",2500,ToastMessageType.Success,ToastPlacement.Bottom);
        this.Subscriptions = data["getSubscriptions"] as Subscriptions[];
        console.log('Subscriptions data' + JSON.stringify(data["getSubscriptions"]));
      }, (err) => {
        this.commonService.hideLoader();
        console.log(JSON.stringify(err));
        this.commonService.toastMessage("Subscriptions fetch failed",2500,ToastMessageType.Error,ToastPlacement.Bottom);
      });

  }

  getFormattedDate(date:any){
    return moment(+date).format("DD-MMM-YY");
  }

}



export class Subscriptions {
  TotalApKidsLosingUser:number;
  SubscriptionDetails:SubscriptionDets[];
}

export class SubscriptionDets {
  Amount:number;
  Currency:string;
  EnrolledOnLocal:string;
  SetupOptions:string;
  ChildKey:string;
  ChildName:string;
}

