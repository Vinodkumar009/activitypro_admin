import { Component } from '@angular/core';
import { NavController, PopoverController, NavParams } from 'ionic-angular';
import { SharedServices } from '../../../services/sharedservice';
import { FirebaseService } from '../../../../services/firebase.service';
import { Storage } from '@ionic/storage';
import $ from "jquery";
import {IonicPage } from 'ionic-angular';
import { CommonService, ToastMessageType, ToastPlacement } from '../../../../services/common.service';
import { HttpService } from '../../../../services/http.service';
import { API } from '../../../../shared/constants/api_constants';
import { CommonRestApiDto } from '../../../../shared/model/common.model';
import { AppType } from '../../../../shared/constants/module.constants';

@IonicPage()
@Component({
    selector: 'assignactivity-page',
    templateUrl: 'assignactivity.html',
    providers:[HttpService]
})
export class AssignActivityPage {
   
    themeType: number;
    selectedParentClub: any;
    activity: any[];
    allClub: any[];
    showMembershipModal: boolean = false;
    selectedActivity = [];
    IsSelectedForsuccess = false;
    selectedVenue: any;
    emailSetupObj = {
        EmailSetupName: 'All Communication',
        SessionOnlinePayment: '',
        CourtBooking: '',
        RoomBooking: '',
        MembertoCoach: '',
        MemberForSessionQuery: '',
        HolidaycampBookingPayment: '',
        SchoolSessionBookingPayment: '',
        HolidaycampQuery: '',
        SchoolSessionQuery: '',
        MemberSessionEnrollment: '',
        CashPayment: '',
        BACSPayment: ''
    }
    update: boolean;
    ClubName: any;
    activityName: any;
    postgre_parentclub_id:string = "";
    constructor(public storage: Storage, 
        public comonService: CommonService, 
        public navParams: NavParams, public navCtrl: NavController, 
        public sharedservice: SharedServices, public fb: FirebaseService,
         public popoverCtrl: PopoverController,
         private httpService:HttpService,) {
      
      this.themeType = sharedservice.getThemeType();
    //   storage.get('userObj').then((val) => {
    //     val = JSON.parse(val);
    //     if(this.selectedVenue = this.navParams.get("venue")){
    //         this.ClubName = this.selectedVenue.ClubName
    //         this.update = true
    //     }
    //     this.selectedParentClub = val.UserInfo[0].ParentClubKey;  
    //     this.fb.getAllWithQuery(`ParentClub/Type2/`,{orderByKey:true,equalTo:this.selectedParentClub}).subscribe((data)=>{
           
    //         this.emailSetupObj.BACSPayment = data[0].ParentClubAdminEmailID;
    //         this.emailSetupObj.CashPayment = data[0].ParentClubAdminEmailID;
    //         this.emailSetupObj.CourtBooking = data[0].ParentClubAdminEmailID;
    //         this.emailSetupObj.HolidaycampBookingPayment = data[0].ParentClubAdminEmailID;
    //         this.emailSetupObj.HolidaycampQuery = data[0].ParentClubAdminEmailID;
    //         this.emailSetupObj.MemberForSessionQuery = data[0].ParentClubAdminEmailID;    
    //         this.emailSetupObj.MemberSessionEnrollment = data[0].ParentClubAdminEmailID;
    //         this.emailSetupObj.MembertoCoach = data[0].ParentClubAdminEmailID;
    //         this.emailSetupObj.RoomBooking = data[0].ParentClubAdminEmailID;
    //         this.emailSetupObj.SchoolSessionBookingPayment = data[0].ParentClubAdminEmailID;
    //         this.emailSetupObj.SchoolSessionQuery = data[0].ParentClubAdminEmailID;
    //         this.emailSetupObj.SessionOnlinePayment = data[0].ParentClubAdminEmailID;
    //     })
    //     this.getClubList()
    //     this.getAllActivity()
       
    //   }).catch(error => {
    //   });
        this.getStorageData();
    }

    async getStorageData(){
        const [login_obj,postgre_parentclub] = await Promise.all([
          this.storage.get('userObj'),
          this.storage.get('postgre_parentclub'),
          //this.storage.get('Currency'),
        ])
    
        if (login_obj) {
            const val = JSON.parse(login_obj);
            if(this.selectedVenue = this.navParams.get("venue")){
                this.ClubName = this.selectedVenue.ClubName
                this.update = true
            }
            this.selectedParentClub = val.UserInfo[0].ParentClubKey;  
            this.fb.getAllWithQuery(`ParentClub/Type2/`,{orderByKey:true,equalTo:this.selectedParentClub}).subscribe((data)=>{
               
                this.emailSetupObj.BACSPayment = data[0].ParentClubAdminEmailID;
                this.emailSetupObj.CashPayment = data[0].ParentClubAdminEmailID;
                this.emailSetupObj.CourtBooking = data[0].ParentClubAdminEmailID;
                this.emailSetupObj.HolidaycampBookingPayment = data[0].ParentClubAdminEmailID;
                this.emailSetupObj.HolidaycampQuery = data[0].ParentClubAdminEmailID;
                this.emailSetupObj.MemberForSessionQuery = data[0].ParentClubAdminEmailID;    
                this.emailSetupObj.MemberSessionEnrollment = data[0].ParentClubAdminEmailID;
                this.emailSetupObj.MembertoCoach = data[0].ParentClubAdminEmailID;
                this.emailSetupObj.RoomBooking = data[0].ParentClubAdminEmailID;
                this.emailSetupObj.SchoolSessionBookingPayment = data[0].ParentClubAdminEmailID;
                this.emailSetupObj.SchoolSessionQuery = data[0].ParentClubAdminEmailID;
                this.emailSetupObj.SessionOnlinePayment = data[0].ParentClubAdminEmailID;
            })
            this.getClubList()
            this.getAllActivity()
        }
        if(postgre_parentclub){
          this.postgre_parentclub_id = postgre_parentclub.Id;
        }
        
        
      }

    getClubList() {
        this.fb.getAllWithQuery("/Club/Type2/" + this.selectedParentClub, { orderByChild: "IsEnable", equalTo: true }).subscribe((data) => {
          this.allClub = data;
          this.allClub.forEach(club => {
              club['isSelect'] = false
          })
        });
    }

    getactivity(){
        this.fb.getAllWithQuery("/Activity/" + this.selectedParentClub + "/" + this.selectedVenue.$key, { orderByChild: "IsEnable", equalTo: true }).subscribe((data) => {
            let activity = data;
            activity.forEach(club => {
                club['isSelect'] = false
           
            // this.activity.forEach(act =>{
            //     act['isForUpdate'] = false
            //     if(act.$key == club.$key ){
            //         act.isSelect = true
            //         act['isForUpdate'] = true
            //     }
            // })

            let selectedActivity = this.activity.filter(actforvenue => actforvenue.$key == club.$key)
            selectedActivity[0].isForUpdate = true
            selectedActivity[0].isSelect = true
            })

            
        });
    }

    getAllActivity() {
        this.fb.getAll("/StandardCode/Activity/Default/").subscribe((data) => {
            if(data.length > 0){
                this.activity = data;
                console.log(this.activity);
                if (this.activity.length != undefined) {
                    for (let i = 0; i < this.activity.length; i++) {
                      
                        this.activity[i].AliasName = this.activity[i].ActivityName;
                        this.activity[i].isSelect = false;
                        this.activity[i]['isForUpdate'] = false
                        this.activity[i].BaseFees = 8.00;
                    }
                }
                this.getactivity()
            }
           
        })
    }

    prompt(){
        this.selectedActivity = this.activity.filter(act => act.isSelect && !act.isForUpdate)
        for(let i =0; i<this.activity.length ; i++){
            if(this.activity[i].isSelect){
                $(`#card${i}`).prop('disabled', true)
            }
        }
        
        this.showMembershipModal = true;
        document.body.scrollTop = 0;
        document.documentElement.scrollTop = 0;
    }
   save(){
       try{
        let activityObj = { ActivityCode: '', ActivityName: '', AliasName: '', IsActive: '', IsEnable: '', IsExistActivityCategory: '', BaseFees: 0, ActivityImageURL:'' };
        let activityCategoryObj = { ActivityCategoryCode: '', ActivityCategoryName: '', IsActive: '', IsEnable: '', IsExistActivitySubCategory: '' }
    
        let activitySubCategoryObj = { ActivitySubCategoryCode: '', ActivitySubCategoryName: '', IsActive: '', IsEnable: ''}
        
        
            for (let activityIndex = 0; activityIndex < this.selectedActivity.length; activityIndex++) {
                activityObj.ActivityCode = this.selectedActivity[activityIndex].ActivityCode;
                activityObj.ActivityName = this.selectedActivity[activityIndex].ActivityName;
                activityObj.AliasName = this.selectedActivity[activityIndex].AliasName;
                activityObj.IsActive = this.selectedActivity[activityIndex].IsActive;
                activityObj.IsEnable = this.selectedActivity[activityIndex].IsEnable;
                activityObj.IsExistActivityCategory = this.selectedActivity[activityIndex].IsExistActivityCategory;
                activityObj.BaseFees = parseInt((this.selectedActivity[activityIndex].BaseFees));
                if( this.selectedActivity[activityIndex].ActivityImageURL){
                    activityObj.ActivityImageURL = this.selectedActivity[activityIndex].ActivityImageURL
                }else{
                    activityObj.ActivityImageURL = "https://firebasestorage.googleapis.com/v0/b/activityprouk-b5815/o/ActivityPro%2FVenueTab%2Fimage.png?alt=media&token=06632505-8a36-4c3f-9bde-ff9f3fcab722"
                }
              
    
                
                    if (this.selectedActivity[activityIndex].isSelect && !this.selectedActivity[activityIndex].isForUpdate) {
                        this.activityName = this.selectedActivity[activityIndex].ActivityName
                        this.fb.update(this.selectedActivity[activityIndex].$key, "Activity/" + this.selectedParentClub + "/" + this.selectedVenue.$key + "/", activityObj);
                        let ActivityCategory = this.comonService.convertFbObjectToArray(this.selectedActivity[activityIndex].ActivityCategory);
                        for (let ActivityCategoryIndex = 0; ActivityCategoryIndex < ActivityCategory.length; ActivityCategoryIndex++) {
                            activityCategoryObj.ActivityCategoryCode = ActivityCategory[ActivityCategoryIndex].ActivityCategoryCode;
                            activityCategoryObj.ActivityCategoryName = ActivityCategory[ActivityCategoryIndex].ActivityCategoryName;
                            activityCategoryObj.IsActive = ActivityCategory[ActivityCategoryIndex].IsActive;
                            activityCategoryObj.IsEnable = ActivityCategory[ActivityCategoryIndex].IsEnable;
                            activityCategoryObj.IsExistActivitySubCategory = ActivityCategory[ActivityCategoryIndex].IsExistActivitySubCategory;
    
                            this.fb.update(ActivityCategory[ActivityCategoryIndex].Key, "Activity/" + this.selectedParentClub + "/" + this.selectedVenue.$key + "/" + this.selectedActivity[activityIndex].$key + "/ActivityCategory/", activityCategoryObj);
    
                            if(ActivityCategory[ActivityCategoryIndex].IsExistActivitySubCategory){
                                let ActivitySubCategory = this.comonService.convertFbObjectToArray(ActivityCategory[ActivityCategoryIndex].ActivitySubCategory);
                                for(let ActivitySubCategoryIndex = 0; ActivitySubCategoryIndex < ActivitySubCategory.length; ActivitySubCategoryIndex++){
                                    activitySubCategoryObj.ActivitySubCategoryCode = ActivitySubCategory[ActivitySubCategoryIndex].ActivitySubCategoryCode;
                                    activitySubCategoryObj.ActivitySubCategoryName = ActivitySubCategory[ActivitySubCategoryIndex].ActivitySubCategoryName;
                                    activitySubCategoryObj.IsActive = ActivitySubCategory[ActivitySubCategoryIndex].IsActive;
                                    activitySubCategoryObj.IsEnable = ActivitySubCategory[ActivitySubCategoryIndex].IsEnable;
    
                                    this.fb.update(ActivitySubCategory[ActivitySubCategoryIndex].Key, "Activity/" + this.selectedParentClub + "/" + this.selectedVenue.$key + "/" + this.selectedActivity[activityIndex].$key + "/ActivityCategory/" +   ActivityCategory[ActivityCategoryIndex].Key   + "/ActivitySubCategory/", activitySubCategoryObj);
                                }
                            }
    
                            
    
                            
                        }
                        this.assignActivityInPostgre();
                        this.Emailsetup(this.selectedActivity[activityIndex].$key)

                          
                        
            }
        }
        this.navCtrl.pop();
       }catch(error){

       }
    
   }

   Emailsetup(activityKey){
    this.fb.getAll("/EmailSetup/Type2/" + this.selectedParentClub + "/" + this.selectedVenue.$key + "/ActivityEmailSetup/" +activityKey + "/").subscribe((data) => {
        if(data.length == 0){
            this.emailSetupObj.EmailSetupName = this.ClubName +" - "+ this.activityName
            this.fb.saveReturningKey("/EmailSetup/Type2/" + this.selectedParentClub + "/" + this.selectedVenue.$key + "/ActivityEmailSetup/" + activityKey + "/", this.emailSetupObj);
        }
    })              
   }

    assignActivityInPostgre() {
        try{
            const assign_activity_payload = {
                paentclub_key: this.selectedParentClub,
                club_key: this.selectedVenue.$key,
                activities: this.selectedActivity.map(activity => activity.$key),
                parentclubId : this.postgre_parentclub_id,
                clubId : this.selectedVenue.ClubID,
                device_id : this.sharedservice.getDeviceId(),
                device_type : this.sharedservice.getPlatform() == "android" ? 1:2,
                app_type : AppType.ADMIN_NEW,
                created_by : this.sharedservice.getLoggedInId(),
            }
            
            
            console.table(assign_activity_payload);
            
            this.httpService.post(API.ASSIGN_CLUB_ACTIVITIES,assign_activity_payload).subscribe((res: any) => {
              //this.navCtrl.pop();
            },
            (error) => {
                //this.commonService.hideLoader();
                console.error("Error in assigning activity:", error.message);
                //this.comonService.toastMessage("Activity assign failed", 2500,ToastMessageType.Error,ToastPlacement.Bottom);
            })
        }catch(err){
          this.comonService.toastMessage(err.message, 2500,ToastMessageType.Error,ToastPlacement.Bottom);
        }    
    }

    cancelVenue() {
        this.navCtrl.pop();
    }

    goToDashboardMenuPage() {
        this.navCtrl.setRoot("Dashboard");
    }
}

export class AssignClubActivityDto extends CommonRestApiDto {
    paentclub_key: string;
    club_key: string;
    activities: string[];
}

export class AssignActivityDto {
    activity_key: string;
    postgre_activity_id?: string;
}