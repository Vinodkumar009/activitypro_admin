import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

/**
 * Generated class for the LeaderboardPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-leaderboard',
  templateUrl: 'leaderboard.html',
})
export class LeaderboardPage {

  leaderboardMenus:Array<any> = [
    {menu:"Leaderboard Configuration", component:"Leaderboardconfig"},
    {menu:"Age Category", component:"AgecategoryPage"}
  ]

  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad LeaderboardPage');
  }

  goToPage(index:number){
    this.navCtrl.push(this.leaderboardMenus[index].component);
  }

}
