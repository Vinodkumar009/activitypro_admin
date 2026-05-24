import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ActionSheetController } from 'ionic-angular';
import { FirebaseService } from '../../../services/firebase.service';
import { CommonService, ToastPlacement, ToastMessageType } from '../../../services/common.service';
import { Storage } from '@ionic/storage';

/**
 * Generated class for the TermsandconditionsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-termsandconditions',
  templateUrl: 'termsandconditions.html',
})
export class TermsandconditionsPage {

  // parentClubDetails:any;
  termsAndConditions = [];
  validtermsAndConditions = [];

  selectedParentClubKey: string;
  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    storage: Storage,
    public actionSheetCtrl : ActionSheetController,
    public fb: FirebaseService,
    public cs: CommonService
  ) {
    storage.get('userObj').then((val) => {
      val = JSON.parse(val);

      for (let user of val.UserInfo) {
        if (val.$key != "") {
          this.selectedParentClubKey = user.ParentClubKey;
          this.getParentClubDetails();
          // if (val.UserType == "2") {
          //   this.getClubDetails();
          // }
        }
      }
    }).catch(error => {

    });
  }

  ionViewWillEnter(){
    //this.getParentClubDetails();
  }

  presentpopover(termsandcondition){
    let actionSheet
    // if (this.platform.is('android')) {
    actionSheet = this.actionSheetCtrl.create({
     
      buttons: [{
      
      
        text: 'Edit',
        
        handler: () => {
          this.navCtrl.push('CreatetermandconditionsPage', {termsandcondition:termsandcondition})
        }
      },
      {
        text: 'Delete',
       
        handler: () => {
          this.cs.commonAlter('Delete Terms & Condition', 'Are you sure?', ()=>{
            this.fb.update(termsandcondition.Key, "/ParentClub/Type2/" + this.selectedParentClubKey + "/TermsAndConditions/", {IsDelete:true} )
          })
          this.navCtrl.pop()
        }  
      },
      ]
    })
    actionSheet.present()
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad TermsandconditionsPage');
  }

  goToCreateTermsandconditions() {
    if(this.canCreateTermsNConditions()){
      this.navCtrl.push("CreatetermandconditionsPage");
    }else{
      this.cs.toastMessage("Please delete or deactivate the existing terms and conditions",3000,ToastMessageType.Error,ToastPlacement.Bottom);
    }
  }

  canCreateTermsNConditions(){
    return this.validtermsAndConditions.length > 0 ? false : true;
  }
  
  getParentClubDetails() {
    this.fb.getAllWithQuery("ParentClub/Type2/", { orderByKey: true, equalTo: this.selectedParentClubKey }).subscribe((data) => {
      //this.parentClubDetails = data[0];
      if (data[0].TermsAndConditions != undefined) {
        this.termsAndConditions = this.cs.convertFbObjectToArray(data[0].TermsAndConditions).filter(terms => !terms.IsDelete);
        this.validtermsAndConditions = this.cs.convertFbObjectToArray(data[0].TermsAndConditions).filter(terms => !terms.IsDelete && terms.IsSwitchedOn);
      }
    });
  }
}
