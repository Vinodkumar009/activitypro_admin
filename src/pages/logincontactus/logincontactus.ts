import { FirebaseService } from '../../services/firebase.service';
import { Component } from '@angular/core';

import { NavController,IonicPage } from 'ionic-angular';

import { SharedServices } from '../services/sharedservice';
import { ToastController } from 'ionic-angular';
import * as $ from 'jquery';
import { CommonService, ToastMessageType } from '../../services/common.service';
import { Keyboard } from 'ionic-angular';
import { HttpClient } from '@angular/common/http';
@IonicPage()
@Component({
    selector: 'logincontactus-page',
    templateUrl: 'logincontactus.html'
})

export class LoginContactUs {
    clubObj = {
        EmailID: '',
        Message: ''
    }

    sendEmail = {
        Members:['string'],
        ImagePath:'string',
        FromEmail:'',
        ToEmail:'',
        CCName:'string',
        CCEmail:'string',
        Subject:'',
        Message:'',
        ToName:'',
        FromName:'',
    }
    nestUrl: any;
    loading: any;
    constructor(private keyboard: Keyboard,public http: HttpClient,public commonService:CommonService,public toastCtrl: ToastController, public navCtrl: NavController, public sharedservice: SharedServices, public fb: FirebaseService) {
        this.nestUrl = this.sharedservice.getnestURL()
    }
    goToLogin() {
        this.navCtrl.pop();
    }

    sendEmailNotification(){
        if(this.clubObj.EmailID){
            if(this.clubObj.Message){
                this.commonService.showLoader()
                this.sendEmail.Message = `AP Admin App\n\n ${this.clubObj.Message}\n customer email - ${this.clubObj.EmailID}`
                this.sendEmail.FromEmail = "Activity Pro UK"
                this.sendEmail.FromName = "AP"
                this.sendEmail.ToName = "Customer"
                this.sendEmail.ToEmail = "europe@activitypro.co.uk"
                this.sendEmail.Subject = "AP Onboarding, No login ID"

                this.http.post(`${this.nestUrl}/messeging/notificationemail`, this.sendEmail).subscribe((res) => {
                    this.commonService.hideLoader()
                    if (res['data']) {
                      this.commonService.toastMessage("Thank you for contacting us...", 2000, ToastMessageType.Success)
                      this.navCtrl.pop()
                    }
          
                  },
                    err => {
                      this.commonService.hideLoader();
                      this.commonService.toastMessage(err['data'], 3000, ToastMessageType.Success)
                })
            
            }else{
            this.commonService.toastMessage('Enter Message', 3000, ToastMessageType.Error)
            }
        }else{
            this.commonService.toastMessage('Enter Email', 3000, ToastMessageType.Error)
        }
    }

}
