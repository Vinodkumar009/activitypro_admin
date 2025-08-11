import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, Slides, AlertController, LoadingController} from 'ionic-angular';
import moment from 'moment';
import { Storage } from '@ionic/storage';
import { HttpClient } from '@angular/common/http';
import { CommonService, ToastMessageType } from '../../../../services/common.service';
import { FirebaseService } from '../../../../services/firebase.service';
import { SharedServices } from '../../../services/sharedservice';

/**
 * Generated class for the FilterbookingsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-createsuperpromotion',
  templateUrl: 'createsuperpromotion.html',
})
export class CreateSuperPromotion {
  TempParentClubs=[];
  totalmembercount: any;
  nestUrl: any;
  countparentClubs = []
  promotion = {
    Title:'',
    ImageUrl:'',
    Sequence:1,
    RedirectedUrl:'',
    CreationDate:0,
    Description:'',
    IsEnable:true,
    IsActive:true
  }
  isUpdate=false
  ParentClubKey:any;
  promotionDefault: any;

  constructor(public navCtrl: NavController, 
    public loadingCtrl: LoadingController, 
    public storage: Storage,
    private http:HttpClient,
    public commonService: CommonService,
    public fb: FirebaseService,
    public navParams: NavParams,
    public sharedService:SharedServices) {

    this.nestUrl = this.sharedService.getnestURL();
    this.ParentClubKey = this.navParams.get('ClubKey')
    this.promotionDefault = this.navParams.get('prmotion')
    if (this.promotionDefault){
      this.promotion = this.promotionDefault
      this.isUpdate = true
    }
    
  }


  updateSetup(){
    if (this.validate()){
      let key = this.promotion['$key'];
      delete this.promotion['$key']
      this.fb.update(key, `ActivityPro/Promotions/${this.ParentClubKey}`, this.promotion)
      this.commonService.toastMessage('Updated Successfully...', 2000, ToastMessageType.Success)
      this.navCtrl.pop()
    }
  }

  saveSetup(){
    if (this.validate()){
      this.promotion.CreationDate = new Date().getTime()
      this.fb.saveReturningKey(`ActivityPro/Promotions/${this.ParentClubKey}`, this.promotion)
      this.commonService.toastMessage('Saved Successfully...', 2000,ToastMessageType.Success)
      this.navCtrl.pop()
    }
  }

  validate(){
    if (!this.promotion.Title){
      this.commonService.toastMessage('Title cannot be blank', 3000, ToastMessageType.Error)
      return false;
    }else if (!this.promotion.ImageUrl){
      this.commonService.toastMessage('Image Url cannot be blank', 3000,ToastMessageType.Error)
      return false;
    }else if (!this.promotion.RedirectedUrl){
      this.commonService.toastMessage('Redirect Url cannot be blank', 3000, ToastMessageType.Error)
      return false;
    }
    return true;
  }

  // this.firebaseAnalytics.logEvent('page_view', {page: "dashboard"})
  // .then((res: any) => console.log(res))
  // .catch((error: any) => console.error(error));

}

export enum PLACEMENT{
  top,
  bottom,
  middle
}
export enum SIZE {
  default=0,
  small=1
}