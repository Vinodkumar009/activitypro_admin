import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { FirebaseService } from '../../../../services/firebase.service';

/**
 * Generated class for the EditpricebandPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-editpriceband',
  templateUrl: 'editpriceband.html',
})
export class EditpricebandPage {
  parentClubKey: string;
  allClub: any[];
  selectedClub: any;
  allActivityArr: any[];
  PriceBand={};
  selectedActivity: any;

  constructor(public navCtrl: NavController, public fb: FirebaseService, public navParams: NavParams) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad EditpricebandPage');
  }

  getClubList() {
     
    this.fb.getAllWithQuery("/Club/Type2/" + this.parentClubKey, { orderByChild: "IsEnable", equalTo: true }).subscribe((data) => {
        //alert();
        if (data.length > 0) {
            this.allClub = data;
            this.selectedClub = this.PriceBand["ClubKey"];
             //this.getAllMemberCategory();
             this.getAllActivity();
        }
      
    })
}


getAllActivity() {
    this.fb.getAll("/Activity/" + this.parentClubKey + "/" + this.selectedClub + "/").subscribe((data) => {
        this.allActivityArr = [];
        this.PriceBand['ActivityDuration'] = "";
        if (data.length > 0) {
            this.allActivityArr = data;
            this.selectedActivity = this.PriceBand["ActivityKey"];
            this.checkAvailability();
           
         }
       
    });
}

checkAvailability(){
  this.fb.getAllWithQuery("StandardCode/BookingSetup/"+this.parentClubKey+"/"+this.selectedActivity,{orderByChild:'ClubKey',equalTo:this.selectedClub}).subscribe((data2) =>{
    this.PriceBand['ActivityDuration'] = "";
    for(let j = 0 ; j < data2.length ;j++){
      if(data2[j].IsActive != false){
       this.PriceBand['ActivityDuration'] = data2[0].CourtDuration;
      }
    }
   })
}

}
