import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, ActionSheetController } from 'ionic-angular';
import { FirebaseService } from '../../../../services/firebase.service';
import { Storage } from '@ionic/storage';
import { Apollo } from "apollo-angular";
import gql from "graphql-tag";
import { CommonService, ToastMessageType, ToastPlacement } from '../../../../services/common.service';
import { HttpService } from '../../../../services/http.service';
import { AppType, ModuleTypes, ParentclubAccountType } from '../../../../shared/constants/module.constants';
import { SharedServices } from '../../../services/sharedservice';
import { API } from '../../../../shared/constants/api_constants';
/**
 * Generated class for the StripeconnectsetuplistPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-stripeconnectsetuplist',
  templateUrl: 'stripeconnectsetuplist.html',
  providers:[HttpService]
})
export class StripeconnectsetuplistPage {
  setupDetails:any = {};
  connectSetupDetails:ParentclubStripeAccounts[] = [];
  parentClubKey:any;
  Addasetup="+ Add Stripe Acount"
  venues = [];

  postgre_parentclub_id:string = "";
  constructor(public alertCtrl:AlertController,
    public storage:Storage ,public navCtrl: NavController,
     public navParams: NavParams,public fb:FirebaseService,
     public commonService: CommonService,
     private apollo: Apollo,
     public sharedservice: SharedServices,
     public actionSheetCtrl: ActionSheetController,
     private httpService:HttpService,) {
      
    storage.get('userObj').then((val) => {
      val = JSON.parse(val);
      for (let club of val.UserInfo)
        if (val.$key != "") {
          this.parentClubKey = club.ParentClubKey;
          //this.getClubVenues();
        }
    })
    this.getStorageData();
  }

  ionViewDidLoad() {
    this.setupDetails = this.navParams.get('setupDetails');
    if(this.setupDetails.SetupName == 'Membership'){
     // this.showalert('We are still setting this up. Thank you for your patience.');
    }else if(this.setupDetails.SetupName == 'Session Management'){
      //this.showalert('Only group session and school session payment is activated. Holiday Camps payment will be available soon.Thank you for your patience.');
    }
  }

  getClubVenues = () => {
    //this.commonService.showLoader("Please wait...");
    const clubVenuesQuery = gql`
      query getAllClubVenues($ParentClub: String!) {
        getAllClubVenues(ParentClub: $ParentClub) {
          ClubName
          ClubKey
        }
      }
    `;
    this.apollo
      .query({
        query: clubVenuesQuery,
        fetchPolicy: "network-only",
        variables: { ParentClub: this.parentClubKey},
      })
      .subscribe(
        ({ data }) => {
          //this.commonService.hideLoader();
          console.log(
            "matches data" + JSON.stringify(data["getAllClubVenues"])
          );
          //this.commonService.hideLoader();
          this.venues = data["getAllClubVenues"];
          this.getStripeConnectSetup();
        },
        (err) => {
          this.commonService.toastMessage("Venues fetch failed",2500,ToastMessageType.Error,ToastPlacement.Bottom);
        }
      );
  };


  getStripeConnectSetup(){
    this.fb.getAllWithQuery(`Activity/${this.parentClubKey}`,{orderByKey:true}).subscribe((clubs)=>{
      this.connectSetupDetails = [];
      //console.log(clubs);
      clubs.forEach((club)=>{
        for(let key in club){
          if(key != '$key'){
            if(club[key].PaymentSetup){
              let paymentSetups = club[key].PaymentSetup;
              for(let setup in paymentSetups){
                let acc_info = Object.keys(paymentSetups[setup]["Properties"])[0];
                //console.log(paymentSetups[setup]["Properties"][acc_info].UserId);
                if(paymentSetups[setup]["PaymentGatewayName"] == "StripeConnect" && paymentSetups[setup]["SetupType"] == this.setupDetails.SetupName){
                  paymentSetups[setup]["ClubName"] = this.venues.find(venue => venue.ClubKey === club.$key).ClubName;
                  paymentSetups[setup]["ClubKey"] = club.$key;
                  paymentSetups[setup]["ActivityKey"] = key; 
                  paymentSetups[setup]["SetupKey"] = setup; //emailSetup[Object.keys(emailSetup)[0]];
                  paymentSetups[setup]["Acc_ID"] = this.getFormattedAccId(paymentSetups[setup]["Properties"][acc_info].UserId);
                  paymentSetups[setup]["ActivityName"] = club[key]["ActivityName"];
                  this.connectSetupDetails.push(paymentSetups[setup])
                }
              }
            }
           

          }
        }
      });
      console.log(this.connectSetupDetails)
    })
  }

  async getStorageData(){
    const [login_obj,postgre_parentclub,currencyDetails] = await Promise.all([
      this.storage.get('userObj'),
      this.storage.get('postgre_parentclub'),
      this.storage.get('Currency'),
    ])

    if (login_obj) {
      this.parentClubKey = JSON.parse(login_obj).UserInfo[0].ParentClubKey;
    }
    if(postgre_parentclub){
      this.postgre_parentclub_id = postgre_parentclub.Id;
    }
    
    this.getStripeAccounts();
  }

  getStripeAccounts(){
    const stripeacc_payload = {
      parentclubId:this.parentClubKey,
      app_type:AppType.ADMIN_NEW,
      device_id:this.sharedservice.getDeviceId(),
      device_type:this.sharedservice.getPlatform() == "android" ? 1:2,
      action_type:0,
      module:this.setupDetails.type,
      account_type:ParentclubAccountType.SESSION_MANAGEMENT
    }
    this.httpService.post(API.GET_PARENTCLUB_STRIPES,stripeacc_payload).subscribe((res: any) => {
      console.table(res.data);
      this.connectSetupDetails = res.data as ParentclubStripeAccounts[];
    },
   (ex) => {
        //this.commonService.hideLoader();
        console.error("Error in fetching:", ex);
        this.commonService.toastMessage(ex.error.message, 2500,ToastMessageType.Error,ToastPlacement.Bottom);
       // Handle the error here, you can display an error message or take appropriate action.
   }) 
  }

  presentActionSheet(eachSetup: ParentclubStripeAccounts) {
    const actionSheet = this.actionSheetCtrl.create({
        //title: 'Send Report',
        buttons: [
            {
                text: eachSetup.status ? "Disable":"Enable",
                handler: () => {
                    this.updateAccountStatus(eachSetup);
                }
            },
            // {
            //     text: 'Copy',
            //     handler: () => {
                    
            //     }
            // },
        ]
    });
    actionSheet.present();
  }

  updateAccountStatus(eachSetup: ParentclubStripeAccounts){
    const stripeacc_payload = {
      setup_id:eachSetup.setup_id,
      status:!eachSetup.status,
      parentclubId:this.parentClubKey,
      clubId:eachSetup.club_id,
      activityId:eachSetup.activity_id,
      app_type:AppType.ADMIN_NEW,
      device_id:this.sharedservice.getDeviceId(),
      device_type:this.sharedservice.getPlatform() == "android" ? 1:2,
      action_type:0,
      module:ModuleTypes.TERMSESSION,
      account_type:ParentclubAccountType.SESSION_MANAGEMENT
    }
    this.httpService.post(API.UPDATE_STRIPE_STATUS,stripeacc_payload).subscribe((res: any) => {
      console.table(res.data);
      this.getStripeAccounts();
      this.commonService.toastMessage(res.messege, 2500, ToastMessageType.Success, ToastPlacement.Bottom)
    },
   (ex) => {
        //this.commonService.hideLoader();
        console.error("Error in fetching:", ex);
        this.commonService.toastMessage(ex.error.message, 2500,ToastMessageType.Error,ToastPlacement.Bottom);
       // Handle the error here, you can display an error message or take appropriate action.
   }) 
  }

  getFormattedAccId(card){
    let cardno = "";
    let cardno_len = card.toString().length;
    for(let i = 0; i < card.toString().length; i++){
      let rem_chat_len = cardno_len - i;
      if((i < 7) || (cardno_len - i) < 5){
        cardno = cardno + card[i];
      }else{
        cardno = cardno + 'x';
      }
    }
    console.log(cardno);
    return cardno;
  }

  goTocreatepage(index:number) {
    this.navCtrl.push('CreatestripeconnectsetupPage', {
      setupDetails: this.setupDetails,setup_type:index
    })
  }
  
  showalert(messege){
    let alert = this.alertCtrl.create({
      title: 'Setup in Progress',
      message:messege,
      buttons: [
        {
          text: 'OK',
          handler: () => {
           // this.navCtrl.pop()
          }   
        },
    
      ]
    });
    alert.present();
  }

}


export class ParentclubStripeAccounts {
  setup_id: string;
  setup_name: string;
  gateway_name: string;
  activity_id: string;
  activity_name: string;
  club_id: string;
  club_name: string;
  formatted_acc_id: string;
  status:boolean;
}