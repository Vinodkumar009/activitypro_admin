import { Component } from '@angular/core';
import { NavController, PopoverController, LoadingController, ActionSheetController, ToastController } from 'ionic-angular';
import { SharedServices } from '../../services/sharedservice';
// import { PopoverPage } from '../../popover/popover';
import { FirebaseService } from '../../../services/firebase.service';
import { Storage } from '@ionic/storage';
import { IonicPage } from 'ionic-angular';
import { CommonService } from '../../../services/common.service';
import { ClubVenueDto, GetParentClubVenuesRequestDto, GetParentClubVenuesResponseDto } from '../../../shared/dtos/club.dto';
import { AppType } from '../../../shared/constants/module.constants';
import { HttpService } from '../../../services/http.service';
import { API } from '../../../shared/constants/api_constants';
@IonicPage()
@Component({
  selector: 'categoryNsubcategory-page',
  templateUrl: 'categoryNsubcategory.html'
})

export class CategoryNsubcategory {

  parentClubKey: string;
  selectedClub: any;

  allClub:ClubVenueDto[] = [];
  selectedActivity: any;
  activity = [];
  selectedClubKey: any;
  selectedClubname: string;
  activityCount = 0;
  subCatCount = 0;
  currencyDetails: any;
  selectedactivityObj;
  catType = '';
  myModal2 = false;
  catDetailsObj = { ActivityCategoryName: "", ActivityCategoryCode: "", IsExistActivitySubCategory: false, IsActive: true, IsEnable: true, CreatedDate: 0, CreatedBy: 'Admin' };
  subCatObj = { ActivitySubCategoryName: "", ActivitySubCategoryCode: "", IsActive: true, IsEnable: true, CreatedDate: 0, CreatedBy: 'Admin' };
  selectedcategorykey: any;
  selectedcategory: any;
  code: string;
  name: string;
  selectedClubs="";
  categorykeys;
  clubmap: Map<string, string[]> = new Map();
  constructor(public commonService: CommonService, public toastCtrl: ToastController, public loadingCtrl: LoadingController, storage: Storage,
    public navCtrl: NavController, public sharedservice: SharedServices,
    public fb: FirebaseService, public popoverCtrl: PopoverController, 
    public actionSheetCtrl: ActionSheetController,
    public sharedService: SharedServices,
    private httpService: HttpService) {
    storage.get('Currency').then((val) => {
      this.currencyDetails = JSON.parse(val);
    })

    storage.get('userObj').then((val) => {
      val = JSON.parse(val);
      for (let club of val.UserInfo)
        if (val.$key != "") {
          this.parentClubKey = club.ParentClubKey;
          this.getAllClub();
        }
    })
  }

  getAllClub() {
    const body: GetParentClubVenuesRequestDto = {
      parentclub_id: this.sharedService.getPostgreParentClubId(),
      app_type: AppType.ADMIN_NEW,
      device_type: this.sharedService.getPlatform() == 'android' ? 1 : 2,
      device_id: this.sharedService.getDeviceId() || 'web',
      updated_by: this.sharedService.getLoggedInUserId()
    };

    this.httpService.post(API.GET_PARENT_CLUB_VENUES, body, null, 1).subscribe({
      next: (res: GetParentClubVenuesResponseDto) => {
        this.allClub = res.data;
        if (this.allClub.length > 0) {
          this.selectedClubKey = this.allClub[0].FirebaseId;
          this.selectedClubs = "";
          this.activity = [];
          
          // Loop through all clubs and get activities for each
          this.allClub.forEach(club => {
            this.selectedClubs = this.selectedClubs + club.FirebaseId + " ";
            this.getAllActivity(club.FirebaseId);
          });
        }
      },
      error: (err) => {
        this.allClub = [];
        console.error('Error fetching clubs:', err);
      }
    });
  }

  addcategory(cat, category?) {
    this.catType = cat
    this.myModal2 = true
    this.selectedcategory = category
    // this.navCtrl.push('CreateCategory',{
    //   activity: this.selectedactivityObj,
    //   cat,
    //   parentClubKey:this.parentClubKey,
    //   selectedClubKey:this.selectedClubKey
    // })
  }


  getAllActivity(selectedClubKey) {
    let x = this.fb.getAll("/Activity/" + this.parentClubKey + "/" + selectedClubKey + "/").subscribe((data) => {
      this.selectedActivity = "";
      if (data.length > 0) {
        data.forEach(activity => {
          let categorylist = []
          let subCategory = []
          let category = this.commonService.convertFbObjectToArray(activity.ActivityCategory).filter(cat => cat.IsActive)
          if (this.clubmap.get(activity.$key)){
            this.clubmap.get(activity.$key).push(selectedClubKey)
          }else{
            this.clubmap.set(activity.$key, [selectedClubKey])
          }
          category.forEach(cat => {
            if (cat.ActivitySubCategory) {
              subCategory = this.commonService.convertFbObjectToArray(cat.ActivitySubCategory).filter(subcat => subcat.IsActive)
            } else {
              subCategory = []
            }
            
            
            let categ = {
              ActivityCategoryName: cat.ActivityCategoryName,
              ActivityCategoryCode: cat.ActivityCategoryCode,
              IsExistActivitySubCategory: cat.IsExistActivitySubCategory,
              ActivityCategorykey: cat.Key,
              subCategory: subCategory,
              IsShowSubCat: false
            }
            categorylist.push(categ)
          })
           
          if (activity.IsActive) {
            let obj = {
              ActivityName: activity.ActivityName,
              ActivityCode: activity.ActivityCode,
              ActivityKey: activity.$key,
              IsShowCat: false,
              clubkeys: this.selectedClubs,
              category: categorylist,
              IsExistActivityCategory: activity.IsExistActivityCategory,
              ActivityImageURL: activity.ActivityImageURL
            }
            let activityarr: any = this.activity
            const isalreadypresent = activityarr.some(act => act.ActivityKey == obj.ActivityKey)
            if (!isalreadypresent) {
              this.activity.push(obj)
            }
            let currentActivity = activityarr.filter(act => act.ActivityKey == obj.ActivityKey)
            let catmap = new Map()
            currentActivity[0].category.forEach(cat => {
              catmap.set(cat.ActivityCategorykey, cat)
            })
            categorylist.forEach(cat => {
              if (!catmap.get(cat.ActivityCategorykey)){
                currentActivity[0].category.push(cat)
              }
            });

          }
        })
        this.activityCount = this.activity.length
        this.selectedActivity = this.activity[0].ActivityKey;
        this.changeActivity(this.selectedActivity)
        x.unsubscribe()
      }
    });
  }

  changeActivity(e) {
    this.activity.forEach(act => {
      if (act.ActivityKey == e) {
        this.selectedactivityObj = act
      }
    })
  }

  closeModal() {
    this.myModal2 = false
  }

  async save() {
    if (!this.validate()) {
      return;
    }

    try {
      const clubkeys = this.clubmap.get(this.selectedactivityObj.ActivityKey);
      
      if (!clubkeys || clubkeys.length === 0) {
        this.commonService.toastMessage('No clubs found for this activity', 3000);
        return;
      }

      if (this.catType === 'Category') {
        await this.saveCategory(clubkeys);
      } else {
        await this.saveSubCategory(clubkeys);
      }

      this.resetFormAndRefresh();
      this.commonService.toastMessage('Saved Successfully!!!', 2500);
    } catch (error) {
      console.error('Error saving:', error);
      this.commonService.toastMessage('Failed to save. Please try again.', 2500);
    }
  }

  private async saveCategory(clubkeys: string[]): Promise<void> {
    this.catDetailsObj.ActivityCategoryCode = '99999';
    this.catDetailsObj.ActivityCategoryName = this.name;
    this.catDetailsObj.CreatedDate = new Date().getTime();

    const basePath = `Activity/${this.parentClubKey}`;
    const activityKey = this.selectedactivityObj.ActivityKey;
    const shouldUpdateFlag = this.selectedactivityObj['IsExistActivityCategory'] === false;

    // Save to first club and get the key
    const categoryPath = `${basePath}/${clubkeys[0]}/${activityKey}/ActivityCategory/`;
    const key: any = this.fb.saveReturningKey(categoryPath, this.catDetailsObj);

    // Update flag for first club if needed
    if (shouldUpdateFlag) {
      await this.fb.update(activityKey, `${basePath}/${clubkeys[0]}`, { IsExistActivityCategory: true });
    }

    // Batch updates for remaining clubs - all operations run in parallel
    const updatePromises: Promise<any>[] = [];
    
    for (let i = 1; i < clubkeys.length; i++) {
      const clubKey = clubkeys[i];
      if (!clubKey) continue;

      const clubBasePath = `${basePath}/${clubKey}`;
      
      // Add category update
      updatePromises.push(
        this.fb.update(key, `${clubBasePath}/${activityKey}/ActivityCategory/`, this.catDetailsObj)
      );

      // Add flag update if needed
      if (shouldUpdateFlag) {
        updatePromises.push(
          this.fb.update(activityKey, clubBasePath, { IsExistActivityCategory: true })
        );
      }
    }

    await Promise.all(updatePromises);
  }

  private async saveSubCategory(clubkeys: string[]): Promise<void> {
    if (!this.selectedcategory) {
      throw new Error('No category selected');
    }

    this.subCatObj.ActivitySubCategoryCode = '999999';
    this.subCatObj.ActivitySubCategoryName = this.name;
    this.subCatObj.CreatedDate = new Date().getTime();

    const basePath = `Activity/${this.parentClubKey}`;
    const activityKey = this.selectedactivityObj.ActivityKey;
    const categoryKey = this.selectedcategory.ActivityCategorykey;
    const shouldUpdateFlag = this.selectedcategory.IsExistActivitySubCategory === false;

    // Save to first club and get the key
    const subCategoryPath = `${basePath}/${clubkeys[0]}/${activityKey}/ActivityCategory/${categoryKey}/ActivitySubCategory/`;
    const sckey: any = this.fb.saveReturningKey(subCategoryPath, this.subCatObj);

    // Update flag for first club if needed
    if (shouldUpdateFlag) {
      await this.fb.update(
        categoryKey,
        `${basePath}/${clubkeys[0]}/${this.selectedActivity}/ActivityCategory/`,
        { IsExistActivitySubCategory: true }
      );
    }

    // Batch updates for remaining clubs - all operations run in parallel
    const updatePromises: Promise<any>[] = [];
    
    for (let i = 1; i < clubkeys.length; i++) {
      const clubKey = clubkeys[i];
      if (!clubKey) continue;

      const clubBasePath = `${basePath}/${clubKey}`;
      
      // Add subcategory update
      updatePromises.push(
        this.fb.update(
          sckey,
          `${clubBasePath}/${activityKey}/ActivityCategory/${categoryKey}/ActivitySubCategory/`,
          this.subCatObj
        )
      );

      // Add flag update if needed
      if (shouldUpdateFlag) {
        updatePromises.push(
          this.fb.update(
            categoryKey,
            `${clubBasePath}/${this.selectedActivity}/ActivityCategory/`,
            { IsExistActivitySubCategory: true }
          )
        );
      }
    }

    await Promise.all(updatePromises);
  }

  private resetFormAndRefresh(): void {
    this.myModal2 = false;
    this.code = '';
    this.name = '';

    if (this.catType === 'Category') {
      this.catDetailsObj = {
        ActivityCategoryName: "",
        ActivityCategoryCode: "",
        IsExistActivitySubCategory: false,
        IsActive: true,
        IsEnable: true,
        CreatedDate: 0,
        CreatedBy: 'Admin'
      };
    } else {
      this.subCatObj = {
        ActivitySubCategoryName: "",
        ActivitySubCategoryCode: "",
        IsActive: true,
        IsEnable: true,
        CreatedDate: 0,
        CreatedBy: 'Admin'
      };
    }

    this.getAllClub();
  }

  validate() {
    if (!this.name) {
      this.commonService.toastMessage(`${this.catType} name can't be empty`, 3000)
      return false
    }
    return true
  }

  delete(category, type,subcat?){
    if (type == 'subcategory'){
      this.selectedcategory = category
      this.commonService.commonAlter('Delete', `Are you sure want to delete ${subcat.ActivitySubCategoryName} sub category?`, ()=>{
        this.selectedactivityObj.clubkeys.split(" ").forEach(clubkey => {
          if (clubkey) {
            this.fb.update(subcat.Key,"Activity/" + this.parentClubKey + "/" + clubkey + "/" + this.selectedactivityObj.ActivityKey + "/ActivityCategory/" + this.selectedcategory.ActivityCategorykey + "/ActivitySubCategory/", {IsActive:false});
            if (this.selectedactivityObj['IsExistActivityCategory'] == true) {
              let IsExistActivitySubCategory = true
              let x = this.fb.getAllWithQuery("Activity/" + this.parentClubKey + "/" + clubkey +"/" + this.selectedactivityObj.ActivityKey + "/ActivityCategory/" , {orderByKey:true, equalTo:this.selectedcategory.ActivityCategorykey}).subscribe(data =>{
                if(!data[0].ActivitySubCategory){
                  IsExistActivitySubCategory= false
                  this.fb.update(this.selectedcategory.ActivityCategorykey,"Activity/" + this.parentClubKey + "/" + clubkey +"/" + this.selectedactivityObj.ActivityKey + "/ActivityCategory/" , {IsExistActivitySubCategory:IsExistActivitySubCategory})
                  
                 
                }
               
                x.unsubscribe()
               
              })
              //this.fb.update(this.selectedActivity, "Activity/" + this.parentClubKey + "/" + clubkey, { IsExistActivityCategory: true });
            }
          }
        });
        this.commonService.toastMessage('Deleted Successfully!!!', 2000)
        this.getAllClub()
      })
    }else{
      this.commonService.commonAlter('Delete', `Are you sure want to delete ${category.ActivityCategoryName} category?`, ()=>{
        this.selectedactivityObj.clubkeys.split(" ").forEach(clubkey => {
          if (clubkey) {
            this.fb.update(category.ActivityCategorykey,"Activity/" + this.parentClubKey + "/" + clubkey + "/" + this.selectedactivityObj.ActivityKey + "/ActivityCategory/", {IsActive:false});
            if (this.selectedactivityObj['IsExistActivityCategory'] == true) {
              let IsExistActivityCategory = true
              let x = this.fb.getAllWithQuery("Activity/" + this.parentClubKey + "/" + clubkey , {orderByKey:true, equalTo:this.selectedactivityObj.ActivityKey}).subscribe((data)=>{
                if(!data[0].ActivityCategory){
                  IsExistActivityCategory= false
                  this.fb.update(this.selectedactivityObj.ActivityKey, "Activity/" + this.parentClubKey + "/" + clubkey, { IsExistActivityCategory: IsExistActivityCategory });
                }
                           
                x.unsubscribe()
              
              })
              
            }
          }
        });
        this.commonService.toastMessage('Deleted Successfully!!!', 2000)   
        this.getAllClub()  
      })
    }
  }

  

}
 


/*
 * ======================== PAGE FLOW SUMMARY ========================
 *
 * 1. getAllClub() — Fetches all venues/clubs under the parent club via API.
 *    For each club returned, it calls getAllActivity(clubKey).
 *
 * 2. getAllActivity(clubKey) — Subscribes to Firebase at /Activity/{parentClubKey}/{clubKey}/.
 *    Collects all active activities into this.activity (deduped by ActivityKey).
 *    Merges categories from multiple clubs into the same activity object.
 *    Builds a clubmap (Map<activityKey, clubKey[]>) to track which clubs share which activity.
 *    Auto-selects the first activity via changeActivity() at the end of each call.
 *
 * 3. changeActivity(activityKey) — Finds the matching activity object and sets it as selectedactivityObj.
 *    Used both for auto-selection and when the user picks a different activity from the UI.
 *
 * 4. addcategory(catType, category?) — Opens the modal for adding a Category or SubCategory.
 *    Sets catType ("Category" or "SubCategory") which determines the save path.
 *    selectedcategory is set when adding a subcategory (stores the parent category).
 *
 * 5. save() — Validates the form, looks up clubmap for the selected activity's clubs,
 *    then routes to saveCategory() or saveSubCategory() based on catType.
 *
 * 6. saveCategory(clubkeys) — Saves the new category to Firebase under:
 *      Activity/{parentClubKey}/{clubKey}/{activityKey}/ActivityCategory/
 *    First club: uses saveReturningKey() to create the entry and get a Firebase key.
 *    Remaining clubs: uses update() with the same key to replicate the category.
 *    Also flips IsExistActivityCategory to true if it was false.
 *
 * CONCLUSION:
 * The clubmap determines which clubs share the selected activity.
 * When a new category/subcategory is created, it gets saved across ALL clubs
 * that have that activity — using the same Firebase key for consistency.
 */
