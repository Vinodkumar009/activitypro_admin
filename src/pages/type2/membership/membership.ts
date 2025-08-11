import { Component, ViewChildren, ViewChild, Renderer2, ElementRef } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, ActionSheetController, Platform, Label, ModalController, ToastController, FabContainer } from 'ionic-angular';
// import * as moment from 'moment';
import { Storage } from '@ionic/storage';
import { CommonService, ToastMessageType, ToastPlacement } from '../../../services/common.service';
import gql from "graphql-tag";
import { GraphqlService } from '../../../services/graphql.service';
import { SharedServices } from '../../services/sharedservice';
import { HttpService } from '../../../services/http.service';
import { IClubDetails } from '../../../shared/model/club.model';
import { API } from '../../../shared/constants/api_constants';
import { Membership } from './dto/membershi.dto';
import { AppType } from '../../../shared/constants/module.constants';
import { first } from 'rxjs/operators';


@IonicPage()
@Component({
    selector: 'page-membership',
    templateUrl: 'membership.html',
    providers:[HttpService]
})
export class MembershipPage {
    @ViewChild('fab')fab : FabContainer;
    ParentClubKey: any;
    Setups = [];
    Options: any[];
    Venues:IClubDetails[]= [];
    currencyDetails: any;
    selectedClubKey: string;
    ClubNameData: any;
    filterSetup = [];
    SetupDisplay = [];
    isAndroid: boolean = false;
    postgre_parentclub_id:string = "";
    Memberships:Membership [] = [];
    constructor(
        public alertCtrl: AlertController,
        public navCtrl: NavController,
        public modalController: ModalController,
        private renderer: Renderer2,
        private elementRef: ElementRef,
        public actionSheetCtrl: ActionSheetController,
        private platform: Platform, 
        public storage: Storage,
        public comonService: CommonService,
        public sharedservice: SharedServices, 
        private graphqlService: GraphqlService,
        private httpService:HttpService,
    ) { 
               
    }


    ionViewWillEnter(){
        this.comonService.category.pipe(first()).subscribe((data) => {
            this.isAndroid = this.platform.is('android');
            if (data == "update_membership_list") {
                this.comonService.updateCategory("");
                this.storage.get('userObj').then((val) => {
                    val = JSON.parse(val);
                    if (val.$key != "") {
                        this.ParentClubKey = val.UserInfo[0].ParentClubKey;
                    }
                    console.log("ParentClubKey: ", this.ParentClubKey)
                });
                this.storage.get('postgre_parentclub').then((postgre_parentclub)=>{
                    this.postgre_parentclub_id = postgre_parentclub.Id;
                    this.getAllVenue()
                }),
                this.storage.get('Currency').then((val) => {
                    this.currencyDetails = JSON.parse(val);
                })  
            }
        })            
    }

    scrollContent: any
    ionViewDidEnter() {
        this.scrollContent = this.elementRef.nativeElement.getElementsByClassName('scroll-content')[0];
        this.fab.close();
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
            this.graphqlService.query(clubs_query,{clubs_input: clubs_input},0)
            .subscribe((res: any) => {
            this.Venues = res.data.getVenuesByParentClub as IClubDetails[];
            console.log("clubs lists:", JSON.stringify(this.Venues));
            this.selectedClubKey = this.Venues[0].FirebaseId;
            console.log("selected club:", this.selectedClubKey);
            this.getSetupByVenue();
            if (this.isAndroid) {
                this.renderer.addClass(this.scrollContent, "androidMargin");
            } else {
                this.renderer.addClass(this.scrollContent, "iosMargin");
            }
        },
        (error) => {
                //this.commonService.hideLoader();
                console.error("Error in fetching:", error);
                this.comonService.toastMessage(error.message, 2500,ToastMessageType.Error, ToastPlacement.Bottom);
            // Handle the error here, you can display an error message or take appropriate action.
        }) 
    }

    checkforSetup(){
        const get_memberships_payload = {
            parentclubId:this.postgre_parentclub_id,
            clubId:this.Venues.find(venue => venue.FirebaseId === this.selectedClubKey).Id,
            action_type:1,
            device_type:this.sharedservice.getPlatform() == "android" ? 1:2,
            app_type:AppType.ADMIN_NEW
          }
          this.httpService.post(API.MEMBERSHIP_SETUP_LIST,get_memberships_payload).subscribe((res: any) => {
            if(res.length == 0 || !res[0].hasOwnProperty('admin_fees')) {
                this.fab.close();
                this.comonService.commonAlert_V4('No membership year setup', 'Membership year setup is mandatory, Want to create a setup?', "Yes:Create","Cancel",()=>{
                    this.goToMembershipYear();
                })
            }
          },
         (error) => {
              //this.commonService.hideLoader();
              console.error("Error in fetching:", error);
              this.comonService.toastMessage("No setups found", 2500,ToastMessageType.Error,ToastPlacement.Bottom);
             // Handle the error here, you can display an error message or take appropriate action.
         })        
    }
    
    
    //for getting setups venue wise and currently using it
    getSetupByVenue() {
        this.Setups = []
        this.SetupDisplay = [];
        this.checkforSetup();
        const get_memberships_payload = {
            parentclubId:this.postgre_parentclub_id,
            clubId:this.Venues.find(venue => venue.FirebaseId === this.selectedClubKey).Id,
            action_type:1,
            device_type:this.sharedservice.getPlatform() == "android" ? 1:2,
            app_type:AppType.ADMIN_NEW
          }
          this.httpService.post(API.MEMBERSHIP_ACTIVE_LIST,get_memberships_payload).subscribe((res: any) => {
            if(res && res.data && res.data.memberships.length > 0) {
                this.Memberships = res.data && res.data.memberships ? res.data.memberships : [];
                this.SetupDisplay = JSON.parse(JSON.stringify(this.Memberships));
            }
          },
         (error) => {
              //this.commonService.hideLoader();
              console.error("Error in fetching:", error);
              this.comonService.toastMessage("No setups found", 2500,ToastMessageType.Error,ToastPlacement.Bottom);
             // Handle the error here, you can display an error message or take appropriate action.
         })
    }
    
    //search membership
    getFilterItems(ev: any) {
        // Reset items back to all of the items
        this.initializeItems();
        // set val to the value of the searchbar
        let val = ev.target.value;
        // if the value is an empty string don't filter the items
        if (val && val.trim() != '') {
            this.SetupDisplay = this.Memberships.filter((item) => {
                if (item.membership_name != undefined) {
                    return (item.membership_name.toLowerCase().indexOf(val.toLowerCase()) > -1);
                }
            })
        }
    }

    initializeItems() {
        //this.filterSetup = this.Setups;
        this.SetupDisplay = this.Memberships;
    }

    goToMembershipYear(){
        this.navCtrl.push("AddmembershipYearPage",{ club_id: this.selectedClubKey })
    }

    goToDiscount() {
        this.comonService.updateCategory("update_membership_discounts_list")
        this.navCtrl.push("MembershipDiscountPage")
    }
    goToEdit(index:number) {
        this.navCtrl.push("UpdateMembershipPage", { membership_id:this.SetupDisplay[index].id })
    }
    
    setupMembership() {
        this.navCtrl.push("MembershipSetupPage", { ClubKey: this.selectedClubKey })
    }

    goToMembershipRenewal(){
        this.navCtrl.push("MembershipRenewalPage", { ClubKey: this.selectedClubKey })
    }

    showOptions(index:number) {
        let actionSheet = this.actionSheetCtrl.create({
            buttons: [
                {
                    text: "Edit Setup",
                    icon: this.platform.is('android') ? 'ios-create-outline' : '',
                    handler: () => {
                        this.goToEdit(index)
                    }
                }
                , {
                    text: 'Delete Setup',
                    cssClass: 'dangerRed',
                    icon: this.platform.is('android') ? 'trash' : '',
                    handler: () => {
                        this.deleteSetup(this.SetupDisplay[index])
                    }
                }
            ]
        });       
        actionSheet.present();
    }
    //delete membership
    deleteSetup(setup:Membership) {
        this.comonService.commonAlert_V4("Delete Setup","Are you sure to delete this setup ?","Delete","Cancel",()=>{
            const get_memberships_payload = {
                parentclubId:this.postgre_parentclub_id,
                clubId:this.Venues.find(venue => venue.FirebaseId === this.selectedClubKey).Id,
                device_id:this.sharedservice.getDeviceId(),
                action_type:0,
                device_type:this.sharedservice.getPlatform() == "android" ? 1:2,
                app_type:AppType.ADMIN_NEW,
                membership_id:setup.id,
                updated_by:this.sharedservice.getLoggedInId()
              }
              this.httpService.post(API.MEMBERSHIP_DELETE,get_memberships_payload).subscribe((res: any) => {
                this.comonService.toastMessage("Setup deleted successfully", 2500, ToastMessageType.Success, ToastPlacement.Bottom);
                this.getSetupByVenue();
              },
             (error) => {
                  //this.commonService.hideLoader();
                  console.error("Error in fetching:", error);
                  this.comonService.toastMessage("No setups found", 2500,ToastMessageType.Error,ToastPlacement.Bottom);
                 // Handle the error here, you can display an error message or take appropriate action.
             })
        })                
    }

    // ionViewWillLeave(){
    //     this.comonService.updateCategory("");
    // }
   
}
