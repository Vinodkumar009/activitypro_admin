import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController } from 'ionic-angular';
import { FirebaseService } from '../../../../services/firebase.service';
import { Storage } from '@ionic/storage';
import { CommonService, ToastMessageType, ToastPlacement } from '../../../../services/common.service';
import * as $ from 'jquery';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { AppType } from '../../../../shared/constants/module.constants';
import { HttpService } from '../../../../services/http.service';
import { SharedServices } from '../../../services/sharedservice';
import { API } from '../../../../shared/constants/api_constants';
import { ParentclubStripeAccounts } from '../stripeconnectsetuplist/stripeconnectsetuplist';

/**
 * Generated class for the CreatestripeconnectsetupPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-createstripeconnectsetup',
  templateUrl: 'createstripeconnectsetup.html',
  providers:[HttpService]
})
export class CreatestripeconnectsetupPage {
  show_selection_view:boolean = true;
  selected_account_id:string = "";
  instructions_arry:Array<{text:string}> = [
    {text:"Select Venue(s) and Activity(ies)"},
    {text:"Enter a name for future reference"},
    {text:"Click on the Link Stripe Account"},
    {text:"Login using your existing Stripe Account or Open a New Stripe Account"},
    {text:"Follow the instructions on the Stripe page"},
    {text:"Once done successfully your Stripe account is ready for accepting payment for the selected venue(s) and activity(ies)"}
  ];
  setupDetails:any;
  setup_type:number = 2;
  setupSet: Set<any> = new Set();
  allClub: Array<any>;
  parentClubKey: string;
  isSelectAll: boolean = false;
  previousParams: any = '';
  activityList: any = [];
  selectedActivity: any;
  divheight: number = 0;
  height: number = 80.8;
  widthofact=0;
  stripeConfigDetails:any = {};
  state_key:string;
  uniqueStripeAccounts:ParentclubStripeAccounts[] = [];
  setupObj = {
    setupType:'',
    name:'',
    parentclubKey: '',
    data:[]
  }
  constructor(private iab: InAppBrowser,
    public navCtrl: NavController, 
    public comonService: CommonService, storage: Storage,
     public fb: FirebaseService, public navParams: NavParams,
     public sharedservice: SharedServices,
     private httpService:HttpService,) {
    this.setupDetails = this.navParams.get('setupDetails')
    this.setup_type = +this.navParams.get('setup_type');
    storage.get('userObj').then((val) => {
      val = JSON.parse(val);
      for (let club of val.UserInfo)
        if (val.$key != "") {
          this.parentClubKey = club.ParentClubKey;
          if(this.setup_type === 2){
            this.getParentClubUniqueStripeAccounts();
          }
          this.getClubList()
          this.getStripeConfig();
        }
    })
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad CreatestripeconnectsetupPage');
  }

  selectActivity(club, activity) {
    club.Activity.forEach(club => {
      if (club.ActivityName == activity.ActivityName) {
        club.isSelect = !club.isSelect
      }
    });
  }

  selectVenue(event) {
    if (this.previousParams == 'All' && event != 'All') {
      this.isSelectAll = false
      this.allClub.forEach(club => {
        if (club.ClubName == event.ClubName) {
          club.isSelect = true
        } else {
          club.isSelect = false
        }
      });
    } else if (event == 'All') {
      this.isSelectAll = !this.isSelectAll
      this.allClub.forEach(club => {
        if (this.isSelectAll) {
          club.isSelect = true;
        } else {
          club.isSelect = false;
        }
      });

    } else {
      this.allClub.forEach(club => {
        if (club.ClubName == event.ClubName) {
          club.isSelect = !club.isSelect
        }
      });
    }

    if (event == 'All') {
      this.previousParams = event
      this.allClub.forEach(element => {
        this.getActivity(element.$key)
      });
     
    } else {
      this.previousParams = event.ClubName
    }
    this.getActivity(event.$key)

  }

  getStripeConfig(){
    this.fb.getAllWithQuery('ActivityPro',{orderByKey:true,equalTo:"StripeConfigDetails"}).subscribe((data)=>{
      this.stripeConfigDetails = data[0];
    })
  }

  getActivity(clubkey) {
    this.fb.getAll("/Activity/" + this.parentClubKey + "/" + clubkey + "/").subscribe((data) => {
      this.activityList = [];
      if (data.length > 0) {
        this.activityList = data;
        this.activityList.forEach(activity => {
          activity['ClubKey'] = clubkey
          activity['isSelect'] = false
        });
        this.allClub.forEach(venue => {
          if (venue.$key == clubkey) {
            venue['Activity'] = this.activityList
          }
          if (this.divheight <= this.activityList.length && venue.isSelect) {
            this.divheight = this.activityList.length
          }
        });

        this.divCalculate()
      }

    })

  }

  getParentClubUniqueStripeAccounts(){
      const stripeacc_payload = {
        parentclubId:this.parentClubKey,
        app_type:AppType.ADMIN_NEW,
        device_id:this.sharedservice.getDeviceId(),
        device_type:this.sharedservice.getPlatform() == "android" ? 1:2,
        action_type:1,
        //module:this.setupDetails.type,
        //account_type:ParentclubAccountType.SESSION_MANAGEMENT
      }
      this.httpService.post(API.GET_PARENTCLUB_STRIPES,stripeacc_payload).subscribe((res: any) => {
        console.table(res.data);
        this.uniqueStripeAccounts = res.data as ParentclubStripeAccounts[];
        if(this.uniqueStripeAccounts.length > 0) this.selected_account_id = this.uniqueStripeAccounts[0].setup_id;
      },
     (ex) => {
          //this.commonService.hideLoader();
          console.error("Error in fetching:", ex);
          if(ex.error && ex.error.message){
            this.comonService.toastMessage(ex.error.message, 2500,ToastMessageType.Error,ToastPlacement.Bottom);
          }else{
            this.comonService.toastMessage("failed to fetch stripe account(s) list", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
          }
         // Handle the error here, you can display an error message or take appropriate action.
     }) 
  }
  

  divCalculate() {
    this.height = 80.8;
    this.widthofact = $("#ionslide").width() / 1.2
    console.log( $("ionslide").width())
    if (this.divheight == 1) {
      this.height = 109.8;    
    } 
    // else if (this.divheight == 2) {
    //   this.height = this.height + 2 * 33;
    // } else if (this.divheight == 3) {
    //   this.height = this.height + 3 * 33;
    // } else if (this.divheight == 4) {
    //   this.height = this.height + 4 * 33;
    // } else if (this.divheight == 5) {
    //   this.height = this.height + 5 * 33;
    // } else if (this.divheight == 6) {
    //   this.height = this.height + 6 * 33;
    // }else if (this.divheight == 7) {
    //   this.height = this.height + 7 * 33;
    // }
    else{
      this.height = this.height + this.divheight * 33;
    }
  
  }



  getClubList() {
    this.fb.getAllWithQuery("/Club/Type2/" + this.parentClubKey, { orderByChild: "IsEnable", equalTo: true }).subscribe((data) => {
      if (data.length > 0) {
        this.allClub = data;
      }
    })
  }
  addSetupMenu(setup) {
    if (this.setupSet.has(setup)) {
      this.setupSet.delete(setup)
    } else {
      this.setupSet.add(setup);
    }
  }
  
  async addSetup(){
    this.setupObj.parentclubKey = this.parentClubKey;
    this.setupObj.setupType = this.setupDetails.SetupName;
    let reqObj = [];
    this.allClub.forEach((club)=>{
      if(club.isSelect){
        let obj = {

          clubKey:club.$key,
          activityKey:''
        }
        let selectedActivity = 0;
        if(club.Activity){
          club.Activity.forEach((activity)=>{
            if(activity.isSelect){
              selectedActivity++;
              obj['activityKey'] += activity.$key +" ";
            }
          });
        }
        if(selectedActivity > 0){
          reqObj.push(obj)
        }
      }
     
    })
    // let selectedClubs:Array<any> = this.allClub.filter((club)=>{
    //   if(club.isSelect != undefined && club.isSelect){
    //     return true;
    //   }else{
    //     return false;     
    //   }
    // });
    this.setupObj.data = reqObj;
    if(this.setupObj.name != "" && this.setupObj.name){ 
      if(reqObj.length > 0){
        this.state_key = await this.fb.saveReturningKey('StripeConnectAccountStates',{data:JSON.stringify(this.setupObj)});
        if(this.setup_type === 1){
          // this.stripeConfigDetails.ClientId = "ca_FmNovlkp34sE0FGQ2jQe68tbkywu8kBi";
            //const stateKey = this.fb.saveReturningKey('StripeConnectAccountStates',{data:JSON.stringify(this.setupObj)});
            const browser = this.iab.create(`${this.stripeConfigDetails.AuthURL}&scope=read_write&client_id=${this.stripeConfigDetails.ClientId}&state=${this.state_key}`,'_blank');
            browser.on('exit').subscribe(() => {
            this.navCtrl.pop();
          }, err => {
            this.navCtrl.pop();
          });
        }else{
          this.show_selection_view = false;
          //copy
        }
      }else{
        this.comonService.toastMessage('Please select atleast a venue and activity',2500,ToastMessageType.Error,ToastPlacement.Bottom);
      }
    }else{
      this.comonService.toastMessage("Please enter account name",2500,ToastMessageType.Error,ToastPlacement.Bottom);
    }
  }

  //this is to copy existing stripe account
  copyStripeAccount(){
    this.comonService.commonAlert_V5("Copy Stripe Account", "Are you sure you want to copy the existing stripe account?", "Yes", "No", (agreed:boolean) => {
      if(agreed){
        const stripeacc_payload = {
          parentclubId:this.parentClubKey,
          app_type:AppType.ADMIN_NEW,
          device_id:this.sharedservice.getDeviceId(),
          device_type:this.sharedservice.getPlatform() == "android" ? 1:2,
          action_type:1,
          state_key:this.state_key,
          setup_id:this.selected_account_id
        }
        this.httpService.post(API.COPY_PARENTCLUB_STRIPE_ACCOUNT,stripeacc_payload).subscribe((res: any) => {
          console.table(res.data);
          this.navCtrl.pop();
        },
       (ex) => {
            //this.commonService.hideLoader();
            console.error("Error in fetching:", ex);
            if(ex.error && ex.error.message){
              this.comonService.toastMessage(ex.error.message, 2500,ToastMessageType.Error,ToastPlacement.Bottom);
            }else{
              this.comonService.toastMessage("failed to copy stripe account", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
            }
           // Handle the error here, you can display an error message or take appropriate action.
       })
      }
    });
     
  }

  accountNameHint() {
    let message = "Please enter a description of the Stripe account for the selected Venue and Activities for future reference";
    this.comonService.toastMessage(message, 2500, ToastMessageType.Info, ToastPlacement.Bottom);
  }


}


