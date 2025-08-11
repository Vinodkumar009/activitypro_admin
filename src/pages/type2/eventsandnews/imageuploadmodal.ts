import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams,ToastController } from 'ionic-angular';
import { ImageFormat, UploadImage } from '../../Model/ImageSection';

/**
 * Generated class for the ImageuploadmodalPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-imageuploadmodal',
  templateUrl: 'imageuploadmodal.html',
})
export class ImageuploadmodalPage {
  format:any = new ImageFormat();
  constructor(public toastCtrl:ToastController,public navCtrl: NavController, public navParams: NavParams) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ImageuploadmodalPage');
  }
  validate(){
    if(this.format.ImageURL == ""){
      this.showToast("Enter URL");
      return false;
    }else if(this.format.ImageDescription ==""){
      this.showToast("Enter Description");
      return false;
    }else{
      return true;
    }
  }
  savePic(){
    if(this.validate()){
      UploadImage.setImage(this.format);
      this.navCtrl.pop();
    }
  }
  cancel(){
    this.navCtrl.pop();
  }
  showToast(message) {
    let toast = this.toastCtrl.create({
      message: message,
      duration: 3000
    });
    toast.present();
  }
}
