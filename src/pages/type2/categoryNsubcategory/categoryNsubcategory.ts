import { Component } from '@angular/core';
import { NavController, PopoverController, LoadingController, ActionSheetController, ToastController } from 'ionic-angular';
import { SharedServices } from '../../services/sharedservice';
// import { PopoverPage } from '../../popover/popover';
import { FirebaseService } from '../../../services/firebase.service';
import { Storage } from '@ionic/storage';
// import { Type2AssignDiscountList } from './assigndiscountlist';
// import { Dashboard } from './../../dashboard/dashboard';
// import { Type2AssignDiscountListClub } from './assigndiscountlistclub';
// import { Type2AssignChargeListClub } from './assignchargelistclub';

import { IonicPage } from 'ionic-angular';
import { CommonService } from '../../../services/common.service';
@IonicPage()
@Component({
  selector: 'categoryNsubcategory-page',
  templateUrl: 'categoryNsubcategory.html'
})

export class CategoryNsubcategory {

  parentClubKey: string;
  selectedClub: any;

  allClub = [];
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
  map
  constructor(public commonService: CommonService, public toastCtrl: ToastController, public loadingCtrl: LoadingController, storage: Storage,
    public navCtrl: NavController, public sharedservice: SharedServices,
    public fb: FirebaseService, public popoverCtrl: PopoverController, public actionSheetCtrl: ActionSheetController) {

    this.map = new Map()
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
    let x = this.fb.getAllWithQuery("/Club/Type2/" + this.parentClubKey, { orderByChild: "IsEnable", equalTo: true }).subscribe((data4) => {
      if (data4.length > 0) {
        this.allClub = []
        this.allClub = data4;
        this.selectedClubs="";
        this.selectedClubKey = this.allClub[0].$key;
        this.activity = [];

        this.allClub.forEach(club => {
          this.selectedClubs =  this.selectedClubs+ club.$key +" "
          this.getAllActivity(club.$key);
        })
        x.unsubscribe()
      }
    })
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
          if (this.map.get(activity.$key)){
            this.map.get(activity.$key).push(selectedClubKey)
          }else{
            this.map.set(activity.$key, [selectedClubKey])
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

  save() {
    if (this.validate()) {

      if (this.catType == 'Category') {
    
          this.catDetailsObj.ActivityCategoryCode = '99999'
        this.catDetailsObj.ActivityCategoryName = this.name
        const clubkeys = this.map.get(this.selectedactivityObj.ActivityKey)
        if (this.selectedactivityObj['IsExistActivityCategory'] == false) {
          this.fb.update(this.selectedactivityObj.ActivityKey, "Activity/" + this.parentClubKey + "/" + clubkeys[0], { IsExistActivityCategory: true });
        }
        this.catDetailsObj.CreatedDate = new Date().getTime();
        const key:any = this.fb.saveReturningKey("Activity/" + this.parentClubKey + "/" + clubkeys[0] + "/" + this.selectedactivityObj.ActivityKey + "/ActivityCategory/", this.catDetailsObj);
        for(let i = 1; i<clubkeys.length; i++){
          if (clubkeys[i]) {
            // let x = this.fb.getAll("/Activity/" + this.parentClubKey + "/" + clubkeys[i] + "/").subscribe((data) => {

            // })
            if (this.selectedactivityObj['IsExistActivityCategory'] == false) {
              this.fb.update(this.selectedactivityObj.ActivityKey, "Activity/" + this.parentClubKey + "/" + clubkeys[i], { IsExistActivityCategory: true });
            }
            this.catDetailsObj.CreatedDate = new Date().getTime();
            this.fb.update(key,"Activity/" + this.parentClubKey + "/" + clubkeys[i] + "/" + this.selectedactivityObj.ActivityKey + "/ActivityCategory/", this.catDetailsObj);
          }
        }
        this.myModal2 = false
        this.code = ''
        this.name = ''
        this.commonService.toastMessage('Saved Successfully!!!', 2000)
        this.catDetailsObj = { ActivityCategoryName: "", ActivityCategoryCode: "", IsExistActivitySubCategory: false, IsActive: true, IsEnable: true, CreatedDate: 0, CreatedBy: 'Admin' }
        this.getAllClub() 
      } else {
        this.subCatObj.CreatedDate = new Date().getTime();
        this.subCatObj.ActivitySubCategoryCode = '999999'   
        this.subCatObj.ActivitySubCategoryName = this.name
        const clubkeys = this.map.get(this.selectedactivityObj.ActivityKey)
        const sckey:any = this.fb.saveReturningKey("Activity/" + this.parentClubKey + "/" + clubkeys[0] + "/" + this.selectedactivityObj.ActivityKey + "/ActivityCategory/" + this.selectedcategory.ActivityCategorykey + "/ActivitySubCategory/", this.subCatObj);

            if (this.selectedcategory.IsExistActivitySubCategory == false) {
              this.fb.update(this.selectedcategory.ActivityCategorykey, "Activity/" + this.parentClubKey + "/" + clubkeys[0] + "/" + this.selectedActivity + "/ActivityCategory/", { IsExistActivitySubCategory: true });
            }
        for(let i = 1; i<clubkeys.length; i++){
          if (clubkeys[i]) {
            this.fb.update(sckey, "Activity/" + this.parentClubKey + "/" + clubkeys[i] + "/" + this.selectedactivityObj.ActivityKey + "/ActivityCategory/" + this.selectedcategory.ActivityCategorykey + "/ActivitySubCategory/", this.subCatObj);

            if (this.selectedcategory.IsExistActivitySubCategory == false) {
              this.fb.update(this.selectedcategory.ActivityCategorykey, "Activity/" + this.parentClubKey + "/" + clubkeys[i] + "/" + this.selectedActivity + "/ActivityCategory/", { IsExistActivitySubCategory: true });
            }
          }
        }
        this.myModal2 = false
        this.code = ''
        this.name = ''
        
        this.commonService.toastMessage('Saved Successfully!!!', 2000)
        this.subCatObj = { ActivitySubCategoryName: "", ActivitySubCategoryCode: "", IsActive: true, IsEnable: true, CreatedDate: 0, CreatedBy: 'Admin' };

        this.getAllClub()
      }
    }
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

  showToast(message) {
    let toast = this.toastCtrl.create({
      message: message,
      duration: 3000
    });
    toast.present();
  }

}
