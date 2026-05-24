import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController } from 'ionic-angular';
import { FirebaseService } from '../../../services/firebase.service';
import { Storage } from '@ionic/storage';
import { Category } from '../../Model/ImageSection';
import { CommonService,ToastPlacement, ToastMessageType } from '../../../services/common.service';
// import { SharedServices } from '../../services/sharedservice';

/**
 * Generated class for the CreatetermandconditionsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-createtermandconditions',
  templateUrl: 'createtermandconditions.html',
})
export class CreatetermandconditionsPage {
  
  termsAndCondition = {
    termsType:"1",
    Title: "Terms and conditions",
    ContentUrl: "",
    LegalNotificationText: "",
    Button1Text: "Review Later",
    Button2Text: "Agree",
    IsSwitchedOn: true,
    IsDelete: false,
    Purpose:{},
   
    CreatedDate: new Date().getTime(),
    UpdatedDate: new Date().getTime()
  };
  purposeDisabled= true;
  purposeList = [
    { category: 'Member app', createTime: '', code:0, IsAvailable: true, IsActive: true},
    { category: 'Holiday Camp', createTime: '',  code:1, IsAvailable: true, IsActive: true},
    { category: 'Term Session', createTime: '',  code:2, IsAvailable: true,  IsActive: true},
    { category: 'Weekly Session', createTime: '',  code:3, IsAvailable: true,  IsActive: true},
    { category: 'Court Booking', createTime: '',  code:4,   IsAvailable: true, IsActive: true},
   
  ]
  selectedParentClubKey: string;
  selectedpurpose = 0;
  editabletermsandcondition;
  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    storage: Storage,
    public fb: FirebaseService,
    public toastCtrl: ToastController,
    public cs: CommonService
  ) {
   if( this.editabletermsandcondition = this.navParams.get('termsandcondition')){
    this.termsAndCondition = this.editabletermsandcondition;
    this.termsAndCondition["termsType"] = this.editabletermsandcondition["termsType"]!=undefined ? this.editabletermsandcondition["termsType"]:"1";
    if(!this.termsAndCondition.Purpose){
      this.termsAndCondition.Purpose = this.purposeList.filter(purpose => purpose.code == 0)[0]
      this.selectedpurpose = 0
    }
   }
    

    storage.get('userObj').then((val) => {
      val = JSON.parse(val);

      for (let user of val.UserInfo) {
        if (val.$key != "") {
          this.selectedParentClubKey = user.ParentClubKey;

          // if (val.UserType == "2") {
          //   this.getClubDetails();
          // }
        }
      }
    }).catch(error => {

    });
  }
  validateContentUrl(contentUrl){
    // //var re=/^https\:\/\/[0-9a-zA-Z]([-.\w]*[0-9a-zA-Z])*(:(0-9)*)*(\/?)([a-zA-Z0-9\-\.\?\,\'\/\\\+&amp;%\$#_]*)?$/;
    // var urlregex = /^https\:\/\/[0-9a-zA-Z]([-.\w]*[0-9a-zA-Z])*(:(0-9)*)*(\/?)([a-zA-Z0-9\-\.\?\,\'\/\\\+&amp;%\$#_]*)?$/;
    // return urlregex.test(contentUrl);
    let ishttpurl = contentUrl.split(":")[0];
    if(ishttpurl != "https"){
      return false;
    }
    return true;
  }
// regex for checking url is https: ^((https?|ftp|smtp):\/\/)?(www.)?[a-z0-9]+\.[a-z]+(\/[a-zA-Z0-9#]+\/?)*$
  validateInputs(): boolean {
    //console.log(this.validateContentUrl(this.termsAndCondition.ContentUrl.trim()));
    if (this.termsAndCondition.Title.trim() == "") {
      let msg = "Please enter title";
      this.cs.toastMessage(msg,3000,ToastMessageType.Error,ToastPlacement.Bottom);
      return false;
    }
    else if (this.termsAndCondition.termsType == '0' && this.termsAndCondition.LegalNotificationText.trim() == "") {
      let msg = "Please enter legal notification text";
      this.cs.toastMessage(msg,3000,ToastMessageType.Error,ToastPlacement.Bottom);
      return false;
    }
    else if (this.termsAndCondition.termsType == '1' && this.termsAndCondition.ContentUrl.trim() == "") {
      let msg = "Please enter content url";
      this.cs.toastMessage(msg,3000,ToastMessageType.Error,ToastPlacement.Bottom);
      return false;
    }
    else if (this.termsAndCondition.termsType == '1' && !this.validateContentUrl(this.termsAndCondition.ContentUrl)) {
      let msg = "Please enter the url with https only";
      this.cs.toastMessage(msg,3000,ToastMessageType.Error,ToastPlacement.Bottom);
      return false;
    }
    else if (this.termsAndCondition.Button1Text.trim() == "" && this.termsAndCondition.Button2Text.trim() == "") {
      let msg = "Please enter atleast one button text";
      this.cs.toastMessage(msg,3000,ToastMessageType.Error,ToastPlacement.Bottom);
      return false;
    }
    return true;

  }
  


  changePurpose(){
    let purposeSelected = this.purposeList.filter( purpose => purpose.code === +this.selectedpurpose)
    this.termsAndCondition.Purpose = purposeSelected[0]
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad CreatetermandconditionsPage');
  }
  createTermsandCondition() {
    if(this.editabletermsandcondition){
      if (this.validateInputs()) {
        let key = this.termsAndCondition['Key']
        delete this.termsAndCondition['Key']
        this.fb.update(key,"/ParentClub/Type2/" + this.selectedParentClubKey + "/TermsAndConditions/", this.termsAndCondition);
        this.cs.toastMessage("Successfully updated terms and conditions", 3000,ToastMessageType.Success,ToastPlacement.Bottom);
        this.navCtrl.pop();
      }
    }else{
      if (this.validateInputs()) {
        if((!this.termsAndCondition.Purpose) || (Object.keys(this.termsAndCondition.Purpose).length == 0)){
          this.termsAndCondition.Purpose = this.purposeList.filter(purpose => purpose.code == 0)[0]
          this.selectedpurpose = 0
        }
        this.fb.saveReturningKey("/ParentClub/Type2/" + this.selectedParentClubKey + "/TermsAndConditions/", this.termsAndCondition);
        this.cs.toastMessage("Successfully created terms and conditions", 3000,ToastMessageType.Success,ToastPlacement.Bottom);
        this.navCtrl.pop();
      }
    }
   
  }

  showUrlHint(){
    this.cs.toastMessage("Please enter the url with https only.", 3000,ToastMessageType.Info,ToastPlacement.Bottom);
  }
  cancel() {
    this.navCtrl.pop();
  }
  presentToast(msg: string, duration: number) {
    let toast = this.toastCtrl.create({
      message: msg,
      duration: duration
    });
    toast.present();
  }
}
