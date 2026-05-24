import { Component, ViewChildren, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, Slides, AlertController, ActionSheetController, Platform, Label, ModalController, ToastController, FabContainer, LoadingController, Events } from 'ionic-angular';
// import * as moment from 'moment';
import { Storage } from '@ionic/storage';
import { FirebaseService } from '../../../services/firebase.service';
import { SharedServices } from '../../services/sharedservice';
import { CommonService, ToastMessageType, ToastPlacement } from '../../../services/common.service';
import { HttpClient } from '@angular/common/http';
import { GraphqlService } from '../../../services/graphql.service';
import { HttpService } from '../../../services/http.service';
import { IClubDetails } from '../../../shared/model/club.model';
import { Membership } from '../membership/dto/membershi.dto';
import gql from "graphql-tag";
import { API } from '../../../shared/constants/api_constants';
import { AppType } from '../../../shared/constants/module.constants';

@IonicPage()
@Component({
    selector: 'page-membershiprecord',
    templateUrl: 'membershiprecord.html',
    providers:[HttpService]
})
export class MembershipRecord {
    @ViewChild('fab')fab : FabContainer;
    platform:string = "";
    ParentClubKey: any;
    Setups = [];
    Options: any[];
    temp;
    Venues:IClubDetails[]= [];;
    currencyDetails: any;
    selectedClubKey: string = '';
    ClubNameData: any;
    filterSetup = [];
    SetupDisplay = [];
    loading: any;
    nodeUrl: string;
    currencycode: any;
    postgre_parentclub_id:string = "";
    Memberships:Membership [] = [];
    renewal_count:number = 0;
    isDarkTheme: boolean = true;
    
    constructor(
        public alertCtrl: AlertController,
        public navCtrl: NavController,
        public modalController: ModalController,
        public actionSheetCtrl: ActionSheetController,
        public loadingCtrl : LoadingController,
        public http:  HttpClient,
        public sharedservice: SharedServices,
        public comonService: CommonService,
        public storage: Storage,
        private graphqlService: GraphqlService,
        private httpService:HttpService,
        public events_subscription: Events
    ) {
        this.platform = this.sharedservice.getPlatform();
        storage.get('userObj').then((val) => {
            val = JSON.parse(val);
            if (val.$key != "") {
                this.ParentClubKey = val.UserInfo[0].ParentClubKey;
                this.currencycode = val.Currency;
            }
            console.log("ParentClubKey: ", this.ParentClubKey);
        })
        storage.get('postgre_parentclub').then((postgre_parentclub)=>{
            this.postgre_parentclub_id = postgre_parentclub.Id;
            this.getAllVenue();
            this.getRenewalCount();
        })
        storage.get('Currency').then((val) => {
            this.currencyDetails = JSON.parse(val);
        })
    }

    ionViewWillEnter() {
        this.loadTheme();
    }

    ionViewWillLeave() {
        this.events_subscription.unsubscribe('theme:changed');
    }

    loadTheme() {
        this.storage
            .get("dashboardTheme")
            .then((isDarkTheme) => {
                console.log(
                    "Membership record page - loaded theme from storage:",
                    isDarkTheme
                );
                if (isDarkTheme !== null) {
                    this.isDarkTheme = isDarkTheme;
                } else {
                    this.isDarkTheme = true;
                }
                this.applyTheme();
            })
            .catch((error) => {
                console.log("Membership record page - error loading theme:", error);
                this.isDarkTheme = true;
                this.applyTheme();
            });

        this.events_subscription.subscribe("theme:changed", (isDark) => {
            console.log("Membership record page - received theme change event:", isDark);
            this.isDarkTheme = isDark;
            this.applyTheme();
        });
    }

    applyTheme() {
        const membershipElement = document.querySelector("page-membershiprecord");
        console.log(
            "Membership record page - applying theme:",
            this.isDarkTheme ? "dark" : "light"
        );

        if (membershipElement) {
            if (this.isDarkTheme) {
                membershipElement.classList.remove("light-theme");
                document.body.classList.remove("light-theme");
                console.log("Membership record page - applied dark theme");
            } else {
                membershipElement.classList.add("light-theme");
                document.body.classList.add("light-theme");
                console.log("Membership record page - applied light theme");
            }
        } else {
            setTimeout(() => {
                const retryElement = document.querySelector("page-membershiprecord");
                if (retryElement) {
                    if (this.isDarkTheme) {
                        retryElement.classList.remove("light-theme");
                        document.body.classList.remove("light-theme");
                    } else {
                        retryElement.classList.add("light-theme");
                        document.body.classList.add("light-theme");
                    }
                    console.log("Membership record page - theme applied on retry");
                }
            }, 100);
        }
    }

    getAllVenue() {
        this.Venues = [];
        const clubs_input = {
        parentclub_id:this.postgre_parentclub_id,
        user_postgre_metadata:{
            UserMemberId:this.sharedservice.getLoggedInId()
        },
        user_device_metadata:{
            UserAppType:AppType.ADMIN_NEW,
            UserDeviceType:this.sharedservice.getPlatform() == "android" ? 1:2
        }
        }
        const clubs_query = gql`
            query getVenuesByParentClub($clubs_input: ParentClubVenuesInput!){
            getVenuesByParentClub(clubInput:$clubs_input){
                    Id
                    ClubName
                    FirebaseId
                    MapUrl
                    sequence
                }
            }`;
            this.graphqlService.query(clubs_query,{clubs_input: clubs_input},0).subscribe((res: any) => {
            this.Venues = res.data.getVenuesByParentClub as IClubDetails[];
            //console.log("clubs lists:", JSON.stringify(this.clubs));
            this.selectedClubKey = this.Venues[0].FirebaseId;
            
        },
        (error) => {
                //this.commonService.hideLoader();
                console.error("Error in fetching:", error);
                this.comonService.toastMessage(error.message, 2500,ToastMessageType.Error, ToastPlacement.Bottom);
        }) 
    }


    getRenewalCount() {
        const get_renewal_count_payload = {
            parentclubId:this.postgre_parentclub_id,
            //clubId:this.Venues.find(venue => venue.FirebaseId === this.selectedClubKey).Id,
            action_type:1,
            device_type:this.sharedservice.getPlatform() == "android" ? 1:2,
            app_type:AppType.ADMIN_NEW//new admin
          }
          this.httpService.post(API.GET_NEXT_RENEWAL_COUNT,get_renewal_count_payload).subscribe((res: any) => {
            if(res && res.data) {
                this.renewal_count = res.data.member_count;
            }
          },
         (error) => {
              //this.commonService.hideLoader();
              console.error("Error in fetching:", error);
              this.comonService.toastMessage("No setups found", 2500,ToastMessageType.Error,ToastPlacement.Bottom);
             // Handle the error here, you can display an error message or take appropriate action.
         })          
    }

    gotoDets(membership,type:number){
        if(type == 1 && this.renewal_count == 0){
            this.comonService.toastMessage("No renewals found", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
            return false;
        }
        this.navCtrl.push('membershipMemberListing', { membership, type})
    }

    //get list of memberships             
    getSetupByVenue(){
     
            this.SetupDisplay = [];
            
            // try {
            //   this.loading = this.loadingCtrl.create({
            //     content: 'Please wait...'
            //   });
            //   this.loading.present();
        
           
            //   this.nodeUrl = "https://activitypro-node-admin.appspot.com";
            
            //   this.http.post(`${this.nodeUrl}/membership/description`, {
            //     parentCLubKey: this.ParentClubKey,
            //     clubKey: selectedClubKey,
            //     selectedSetupKey: '',
            //     memberkey: '',
            //     wantmemberlist: true
            //   }).subscribe((res) => {
            //     this.loading.dismiss()
            //     if (res['eachMembershipDetails']){
            //         res['eachMembershipDetails'].forEach(eachSetup => {
            //             if(eachSetup.IsActive){
            //                 eachSetup['memberPresent'] = eachSetup['memberPresent'].filter(ele => ele.IsActive)
            //                 eachSetup['memberPresentCount'] = eachSetup['memberPresent'].length
            //                 this.SetupDisplay.push(eachSetup)
            //             }
            //           });
            //     }
                  
            //   },
            //   err =>{
            //     this.loading.dismiss();
            //   })
            // } catch (err) {
            //   this.loading.dismiss();
            // }
            const get_memberships_payload = {
                parentclubId:this.postgre_parentclub_id,
                clubId:this.Venues.find(venue => venue.FirebaseId === this.selectedClubKey).Id,
                action_type:1,
                device_type:this.sharedservice.getPlatform() == "android" ? 1:2,
                app_type:AppType.ADMIN_NEW//new admin
              }
              this.httpService.post(API.MEMBERSHIP_ACTIVE_LIST,get_memberships_payload).subscribe((res: any) => {
                if(res && res.data && res.data.memberships.length > 0) {
                    this.Memberships = res.data && res.data.memberships ? res.data.memberships : [];
                    this.SetupDisplay = JSON.parse(JSON.stringify(this.Memberships));
                }else{
                    this.comonService.toastMessage("No memberships found", 2500, ToastMessageType.Error, ToastPlacement.Bottom)
                }
              },
             (error) => {
                  //this.commonService.hideLoader();
                  console.error("Error in fetching:", error);
                  this.comonService.toastMessage("No setups found", 2500,ToastMessageType.Error,ToastPlacement.Bottom);
                 // Handle the error here, you can display an error message or take appropriate action.
             })                        
          
    }

  

    gotoHistory(membership){
        this.navCtrl.push('membershipHistoryInfo', {membership : membership, type:'history',ClubKey:this.selectedClubKey})
    }


    
}
