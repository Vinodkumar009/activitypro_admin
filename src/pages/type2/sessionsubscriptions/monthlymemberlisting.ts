import { Component, ViewChildren, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams,  AlertController, ActionSheetController, ModalController, FabContainer } from 'ionic-angular';
// import * as moment from 'moment';
import { Storage } from '@ionic/storage';
import { FirebaseService } from '../../../services/firebase.service';
import { CommonService } from '../../../services/common.service';
import { SharedServices } from '../../services/sharedservice';
import { HttpClient } from '@angular/common/http';
import moment from 'moment'
import { m } from '@angular/core/src/render3';


// import { CommonService } from '../../../services/common.service';
// import { IonicPage } from 'ionic-angular';

@IonicPage()
@Component({
    selector: 'page-monthlymemberlisting',
    templateUrl: 'monthlymemberlisting.html',
})
export class MonthlyMemberListing {
    
    platformType: string = "";
    PaidMembers = [];
    PendingMembers = [];
    isSelected: boolean = false;
    ParentClubKey: any;
    currencyDetails: any; 
    filterSetup = [];
    SetupDisplay = [];
    loading: any;
    nestUrl: string;
    currencycode: any;
    Session: any;
    ClubKey: any;
    
    type: any;

    constructor(
        public alertCtrl: AlertController,
        public navCtrl: NavController,
        public navParam: NavParams,
        public modalController: ModalController,
        private fb: FirebaseService,
        public actionSheetCtrl: ActionSheetController,
        storage: Storage,
        public sharedservice: SharedServices,
        public comonService: CommonService
    ) {
        this.platformType = this.sharedservice.getPlatform();
        //this.ClubKey = this.navParam.get('ClubKey')
        storage.get('userObj').then((val) => {
            val = JSON.parse(val);
            if (val.$key != "") {
                this.ParentClubKey = val.UserInfo[0].ParentClubKey;
                this.currencycode = val.Currency;
            }
            console.log("ParentClubKey: ", this.ParentClubKey)
            this.Session = this.navParam.get('session');
           
            this.Session.Member.forEach(member => {
                if(member.MonthlySession){
                    const monthsArray = Object.keys(member.MonthlySession).map(month => moment(month, "MMM-YYYY"));
                        // to find the maximum date from a list
                        const maxDate = moment.max(monthsArray).format("MMM-YYYY");
                        const minDate = moment.min(monthsArray).format("MMM-YYYY");
                        const expiryDate = moment(maxDate, "MMM-YYYY").clone().endOf('month').format("MMM-YYYY");
                        member.MonthlySession = this.comonService.convertFbObjectToArray(member.MonthlySession);
                        member["SessionFee"] = member.MonthlySession[0].SessionFee;
                        member["Expiry"] = expiryDate;
                        member["StartsFrom"] = minDate;
                        member["EndsOn"] = maxDate;
                }
            })

        })
        storage.get('Currency').then((val) => {
            this.currencyDetails = JSON.parse(val);
        })
    }

    openActionSheet(member) {
        let actionSheet = this.actionSheetCtrl.create({
           
            buttons: [
                {
                    text: "View Sessions",
                    icon: 'ios-eye',
                    handler: () => {
                        this.navCtrl.push('MonthsListModal', { member, SessionName: this.Session.SessionName });
                    }
                },
                {
                    text: 'Cancel Membership',
                    icon: 'ios-close',
                    role: 'cancel',
                    handler: () => {}
                },
                //  {
                //     text: 'Cancel Membership',
                //     icon: this.platform.is('android') ? 'ios-trash-outline' : '',
                //     handler: () => {
                //         this.navCtrl.push('CancelMembershipPage', { membership: this.membership, member: member })
                //     }
                // }
            ]
            
        });

        actionSheet.present();
    }

    // createButtons(member) {
    //     let buttons = [];
    //     let button 
    //     let possibleButtons = [{text: 'Manage Membership',icon:'ios-create-outline',},
    //     {text: 'Membership Details',icon:'ios-clipboard-outline',},{text: 'Cancel Membership',icon:'ios-trash-outline',},
    //     {text: 'Payment Update',icon:'ios-create-outline',}]

    //     if(member.PaymentOptions != 'Monthly' || member.IsCancelled){
    //         possibleButtons.splice(2, 1)
    //     }   
    //     if(member.PaymentOptions == 'Monthly'){
    //         possibleButtons.pop()
    //     } 
    //     if(member.PaymentOptions == 'Yearly' && member.IsPaid){
    //         possibleButtons.pop()
    //     } 
    //     for (var index in possibleButtons) {
    //         let handler
    //         if(possibleButtons[index].text == 'Manage Membership'){
    //             handler = ()=>{
    //                 this.navCtrl.push('ShowmembershipPage', {
    //                     ParentClubKey: this.ParentClubKey,
    //                     ClubKey: this.ClubKey,
    //                     MemberKey: member.IsChild ? member.ParentKey : member.MemberKey,
    //                 })
    //             }
               
    //         }else if(possibleButtons[index].text == 'Membership Details'){
    //             handler = ()=>{
    //                 this.navCtrl.push('MonthlyRecord', { membership: this.membership, member: member })
    //             }
    //         }else if(possibleButtons[index].text == 'Cancel Membership'){
    //             handler = () => {
    //                 this.navCtrl.push('CancelMembershipPage', { membership: this.membership, member: member })
    //             }
    //         }else if(possibleButtons[index].text == 'Payment Update'){
    //             handler = () => {
    //                 this.navCtrl.push('UpdatePayment', { membership: this.membership, member: member })
    //             }
    //         }
    //         button = {
    //             text: possibleButtons[index].text,
    //             icon: possibleButtons[index].icon,
    //             handler: handler
    //           }
    //       buttons.push(button);
    //     }
    //     return buttons;
    //   }
    
    

    
}
