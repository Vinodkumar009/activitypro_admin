import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
@IonicPage()
@Component({
  selector: 'page-showcoachrating',
  templateUrl: 'showcoachrating.html',
})
export class ShowcoachratingPage {
  coachRating:any = [];
  avgperformance:any=""
  name:any = "";
  NewSessionDetials:any = "";
  memberDetails = ""
  constructor(public navCtrl: NavController, public navParams: NavParams) {
    this.coachRating = this.navParams.get('data');
    this.NewSessionDetials = this.navParams.get('sessionDetails');
    this.memberDetails = this.navParams.get('member')
    this.avgperformance =this.coachRating[this.coachRating.length -1].AveragePerformance;
    this.name = this.coachRating[this.coachRating.length -1].MemberName;
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ShowcoachratingPage');
  }
  goToTemplatListpage(){
    this.navCtrl.push('TemplatelistPage',{
      sessionDetails:this.NewSessionDetials,
      member:this.memberDetails
    });
  }
  goToCoachRatingHistorypage(){
    this.navCtrl.push('CoachratinghistoryPage',{
      sessionDetails:this.NewSessionDetials,
      member:this.memberDetails
    });
  }
  goTotemplateListingPage(){
    this.navCtrl.push('CoachratinghistoryPage',{
      sessionDetails:this.NewSessionDetials,
      member:this.memberDetails
    })
  }
}
