import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Category, Listname } from '../../Model/ImageSection';


/**
 * Generated class for the ActivitymodalPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-activitymodal',
  templateUrl: 'activitymodal.html',
})
export class ActivitymodalPage {

list = new Category().CategoryList;
category:any = {};
iconList = new Listname().iconsList;
  constructor(public navCtrl: NavController, public navParams: NavParams) {
    this.category = this.navParams.get('act');
  }
  select(activity){
    Listname.setListName(activity);
    this.navCtrl.pop();
  }
  ionViewDidLoad() {
    console.log('ionViewDidLoad ActivitymodalPage');
  }

}
