import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, ToastController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { FirebaseService } from '../../../../services/firebase.service';
import { SharedServices } from '../../../services/sharedservice';
import { CommonService, ToastPlacement, ToastMessageType } from "../../../../services/common.service";
import { HttpService } from '../../../../services/http.service';
import { AppType } from '../../../../shared/constants/module.constants';
import { ExtendedEventInputType, GetCaption } from '../model/event.model';
/**
 * Generated class for the AddcaptionPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-addcaption',
  templateUrl: 'addcaption.html',
  providers: [HttpService]
})
export class AddcaptionPage {
  nestUrl: string = "";
  platform: string = "";
  caption: GetCaption;
  captionheader: string;
  captionsubheader: string;
  eventsDto: ExtendedEventInputType = {
    caption_id: '',
    caption_header: '',
    caption_message: '',
    caption_url: '',
    parentclubId: '',
    clubId: '',
    activityId: '',
    memberId: '',
    action_type: 0,
    device_type: 0,
    app_type: 0,
    device_id: '',
    updated_by: ''
  }
  EventCaption: any = { ParentClubKey: "", CaptionHeader: "", CaptionSubHeader: "", status: "create", IsActive: true, CreatedAt: new Date().getTime(), UpdateAt: new Date().getTime() };
  constructor(public navCtrl: NavController, public navParams: NavParams, public loadingCtrl: LoadingController, public toastCtrl: ToastController, public storage: Storage,
    private httpService: HttpService, public fb: FirebaseService, public commonService: CommonService, public sharedService: SharedServices,) {

    this.nestUrl = this.sharedService.getnestURL();
    this.platform = this.sharedService.getPlatform();
    storage.get('userObj').then((val) => {
      val = JSON.parse(val);
      if (val.$key != "") {
        this.EventCaption.ParentClubKey = val.UserInfo[0].ParentClubKey;
        this.eventsDto.app_type = AppType.ADMIN_NEW;
        this.eventsDto.parentclubId = this.sharedService.getPostgreParentClubId();

        this.getCaption();
        this.getParentClubCaptions();
      }
    });
  }

  //Getting Event Caption
  getCaption() {

    this.fb.$post(`${this.nestUrl}/events/getcaption`, this.EventCaption).subscribe((res) => {
      if (res) {
        let Caption = this.commonService.convertFbObjectToArray(res);
        if (Caption.length > 0) {
          this.EventCaption.status = "update";
          this.EventCaption["CaptionKey"] = Caption[0].Key;
          this.EventCaption.CaptionHeader = Caption[0].CaptionHeader;
          this.EventCaption.CaptionSubHeader = Caption[0].CaptionSubHeader;
        }
        console.log(Caption);
      }
    }, (err) => {
      console.log(err);
    });
  }
  getParentClubCaptions() {
    // Show loader with message
    this.commonService.showLoader("Please wait...");

    // Log the input data
    console.log("Input for fetching parent club captions:", this.eventsDto);

    // Make the HTTP POST request
    this.httpService.post('events/caption/get_parentclub_captions', this.eventsDto).subscribe(
      (res: GetCaption) => {
        // Hide loader once response is received
        this.commonService.hideLoader();
        console.log("Response received:", res);

        // Check if the response has expected data
        if (res) {
          this.caption = res; // Assuming `caption` is the key in the response
        } else {
          console.error("Unexpected response structure or missing 'caption':", res);
        }
      },
      (error) => {
        // Hide loader on error
        this.commonService.hideLoader();

        // Log error details for debugging
        console.error("Error fetching parent club captions:", error);
      }
    );
  }


  ionViewDidLoad() {
    console.log('ionViewDidLoad AddcaptionPage');
  }

  CreateCaption() {
    
    this.commonService.showLoader("Please wait");
    let captionId = this.caption.id;
    this.eventsDto.caption_id=captionId;
    this.eventsDto.caption_message=this.caption.caption_message;
    this.eventsDto.caption_header=this.caption.caption_header;
    this.eventsDto.caption_url=this.caption.caption_img_url;
    console.log("input for update",this.eventsDto);
    this.httpService.put(`events/caption/update_caption/${captionId}`, this.eventsDto).subscribe(
      (response) => {
        this.commonService.hideLoader();
        console.log("Caption updated successfully:", response);
        let msg = "Caption updated successfully" ;
        this.commonService.toastMessage(msg, 3000, ToastMessageType.Success, ToastPlacement.Bottom);
        this.navCtrl.pop();

        // Handle successful update (e.g., show a success message or navigate to another page)
      },
      (error) => {
        this.commonService.hideLoader();
        console.error("Error updating caption:", error);
        // Handle error (e.g., display an error message to the user)
      }
    );
  }



}
