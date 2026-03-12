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
import { take } from 'rxjs/operators';
import { ClubVenueDto, GetParentClubVenuesRequestDto, GetParentClubVenuesResponseDto } from '../../../../shared/dtos/club.dto';

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
   async save(){
       this.comonService.showLoader("Please wait");
       try{
        let activityObj = { ActivityCode: '', ActivityName: '', AliasName: '', IsActive: '', IsEnable: '', IsExistActivityCategory: '', BaseFees: 0, ActivityImageURL:'' };
    
        for (let activityIndex = 0; activityIndex < this.selectedActivity.length; activityIndex++) {
            const act = this.selectedActivity[activityIndex];
            if (!act.isSelect || act.isForUpdate) continue;

            activityObj.ActivityCode = act.ActivityCode;
            activityObj.ActivityName = act.ActivityName;
            activityObj.AliasName = act.AliasName;
            activityObj.IsActive = act.IsActive;
            activityObj.IsEnable = act.IsEnable;
            activityObj.IsExistActivityCategory = act.IsExistActivityCategory;
            activityObj.BaseFees = parseInt(act.BaseFees);
            activityObj.ActivityImageURL = act.ActivityImageURL ||
                "https://firebasestorage.googleapis.com/v0/b/activityprouk-b5815/o/ActivityPro%2FVenueTab%2Fimage.png?alt=media&token=06632505-8a36-4c3f-9bde-ff9f3fcab722";

            this.activityName = act.ActivityName;
            this.fb.update(act.$key, "Activity/" + this.selectedParentClub + "/" + this.selectedVenue.$key + "/", activityObj);

            // Fetch categories from all other venues for this activity and deduplicate
            await this.saveCategoriesFromAllVenues(act.$key);

            this.assignActivityInPostgre();
            this.Emailsetup(act.$key);
        }
        this.comonService.hideLoader();
        this.navCtrl.pop();
       } catch(error) {
           this.comonService.hideLoader();
           console.error('Error in save:', error);
       }
   }

   private async saveCategoriesFromAllVenues(activityKey: string): Promise<void> {
       // Get all venues from API (source of truth) — same as categoryNsubcategory.ts
       const body: GetParentClubVenuesRequestDto = {
           parentclub_id: this.postgre_parentclub_id,
           app_type: AppType.ADMIN_NEW,
           device_type: this.sharedservice.getPlatform() == 'android' ? 1 : 2,
           device_id: this.sharedservice.getDeviceId() || 'web',
           updated_by: this.sharedservice.getLoggedInUserId()
       };

       const res = await this.httpService.post(API.GET_PARENT_CLUB_VENUES, body, null, 1).pipe(take(1)).toPromise() as GetParentClubVenuesResponseDto;
       const otherVenues = res.data.filter((club: ClubVenueDto) => club.FirebaseId !== this.selectedVenue.$key);

       // Dedup by Firebase Key — same key is shared across venues (see saveCategory in categoryNsubcategory.ts)
       const categoryMap: Map<string, any> = new Map();

       for (const venue of otherVenues) {
           const venueActivities: any[] = await this.fb.getAll(
               "/Activity/" + this.selectedParentClub + "/" + venue.FirebaseId + "/"
           ).pipe(take(1)).toPromise();

           const matchedActivity = venueActivities.find(a => a.$key === activityKey);
           if (!matchedActivity || !matchedActivity.ActivityCategory) continue;

           const categories = this.comonService.convertFbObjectToArray(matchedActivity.ActivityCategory).filter(cat => cat.IsActive);

           for (const cat of categories) {
               if (!cat || !cat.Key) continue;

               if (!categoryMap.has(cat.Key)) {
                   categoryMap.set(cat.Key, cat);
               } else {
                   // Same Firebase key — merge subcategories
                   const existing = categoryMap.get(cat.Key);
                   if (cat.ActivitySubCategory) {
                       const existingSubcats = this.comonService.convertFbObjectToArray(existing.ActivitySubCategory || {});
                       const newSubcats = this.comonService.convertFbObjectToArray(cat.ActivitySubCategory).filter(s => s.IsActive);
                       const subcatMap: Map<string, any> = new Map();
                       existingSubcats.forEach(s => subcatMap.set(s.Key, s));
                       newSubcats.forEach(s => {
                           if (s.Key && !subcatMap.has(s.Key)) subcatMap.set(s.Key, s);
                       });
                       existing.ActivitySubCategory = Array.from(subcatMap.values()).reduce((acc, s) => {
                           acc[s.Key] = s;
                           return acc;
                       }, {});
                   }
               }
           }
       }

       if (categoryMap.size === 0) return;

       const baseCatPath = "Activity/" + this.selectedParentClub + "/" + this.selectedVenue.$key + "/" + activityKey + "/ActivityCategory/";

       for (const cat of Array.from(categoryMap.values())) {
           const catObj = {
               ActivityCategoryCode: cat.ActivityCategoryCode,
               ActivityCategoryName: cat.ActivityCategoryName,
               IsActive: cat.IsActive,
               IsEnable: cat.IsEnable,
               IsExistActivitySubCategory: cat.IsExistActivitySubCategory || false
           };
           this.fb.update(cat.Key, baseCatPath, catObj);

           if (cat.IsExistActivitySubCategory && cat.ActivitySubCategory) {
               const subcats = this.comonService.convertFbObjectToArray(cat.ActivitySubCategory).filter(s => s.IsActive);
               for (const subcat of subcats) {
                   if (!subcat || !subcat.Key) continue;
                   const subcatObj = {
                       ActivitySubCategoryCode: subcat.ActivitySubCategoryCode,
                       ActivitySubCategoryName: subcat.ActivitySubCategoryName,
                       IsActive: subcat.IsActive,
                       IsEnable: subcat.IsEnable
                   };
                   this.fb.update(subcat.Key, baseCatPath + cat.Key + "/ActivitySubCategory/", subcatObj);
               }
           }
       }

       // Mark activity as having categories
       this.fb.update(activityKey, "Activity/" + this.selectedParentClub + "/" + this.selectedVenue.$key + "/", { IsExistActivityCategory: true });
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
            
            this.httpService.post(API.ASSIGN_CLUB_ACTIVITIES,assign_activity_payload).subscribe({
              next: (res: any) => {
                //this.navCtrl.pop();
              }
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