import { Component, ViewChildren, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, Slides, AlertController, ActionSheetController, Platform, Label, ModalController, ToastController, FabContainer, LoadingController } from 'ionic-angular';
// import * as moment from 'moment';
import { Storage } from '@ionic/storage';
import { FirebaseService } from '../../../../services/firebase.service';
import { CommonService } from '../../../../services/common.service';
import { SharedServices } from '../../../services/sharedservice';
import { HttpClient } from '@angular/common/http';
import moment from 'moment'
import { m } from '@angular/core/src/render3';


// import { CommonService } from '../../../services/common.service';
// import { IonicPage } from 'ionic-angular';

@IonicPage()
@Component({
    selector: 'page-membershiphistoryinfo',
    templateUrl: 'membershiphistoryinfo.html',
})
export class membershipHistoryInfo {
    @ViewChild('fab') fab: FabContainer;
    platformType: string = "";
    PaidMembers = [];
    PendingMembers = [];
    isSelected: boolean = false;
    ParentClubKey: any;
    Setups = [];
    Options: any[];
    temp;
    Venues;
    currencyDetails: any;
    selectedClubKey: any;
    ClubNameData: any;
    filterSetup = [];
    SetupDisplay = [];
    loading: any;
    nodeUrl: string;
    currencycode: any;
    membership: any;
    ClubKey: any;
    ismonthlydetailsOn: boolean = false;
    subscriptionList: any = [];
    type: any;
    expiredMembership=[];
    nestUrl: string;
    membershipCount: any;

    constructor(
        public alertCtrl: AlertController,
        public navCtrl: NavController,
        public navParam: NavParams,
        public modalController: ModalController,
        private fb: FirebaseService,
        public actionSheetCtrl: ActionSheetController,
        private platform: Platform, storage: Storage,
        public loadingCtrl: LoadingController,
        public http: HttpClient,
        public sharedservice: SharedServices,
        private toastCtrl: ToastController, public comonService: CommonService
    ) {
        this.platformType = this.sharedservice.getPlatform();
        this.type = this.navParam.get('type')
        this.ClubKey = this.navParam.get('ClubKey')
        storage.get('userObj').then((val) => {
            val = JSON.parse(val);
            if (val.$key != "") {
                this.ParentClubKey = val.UserInfo[0].ParentClubKey;
                this.currencycode = val.Currency;
            }
           
            this.membership = this.navParam.get('membership')
            this.getBookingHistory()
           

            // this.membership.memberPresent.forEach(mem => {
            //     if (mem.IsPaid) {
            //         this.PaidMembers.push(mem);
            //     } else {
            //         this.PendingMembers.push(mem);
            //     }
            // })

        })
        storage.get('Currency').then((val) => {
            this.currencyDetails = JSON.parse(val);
        })
    }

    getBookingHistory(){
        try {
            this.loading = this.loadingCtrl.create({
              content: 'Please wait...'
            });
            this.loading.present();
      
         
            this.nestUrl = "https://activitypro-nest-261607.appspot.com";
            
            if(this.membership == 'All'){
                this.http.get(`${this.nestUrl}/membership/membershiphistoryinfo?parentClubKey=${this.ParentClubKey}&clubKey=${this.ClubKey}&setupKey=${this.membership}`).subscribe((res) => {
                    this.loading.dismiss()
                    if(res['data'].length > 0){
                        res['data'].forEach(data => {
                            if(data['allAvailableMembershipHistory'].length > 0){
                        
                                data['allAvailableMembershipHistory'].forEach(membership =>  {
                                    membership.SameGroupMember = []
                                    if(data['primaryMemberShipDetails']){
            
                                        data['primaryMemberShipDetails'][membership.primaryMembershipKey].forEach(member => {
                                            
                                            membership.SameGroupMember.push(member)
                                        });
                                    }
                                  
                                    membership.ValidityDate = moment(new Date(membership.Validity)).format('DD MMM YYYY')
                                    this.expiredMembership.push(membership)
                                });
            
                            }
                        });
                      
                      
                    }
                    
                  },
                  err =>{
                    this.loading.dismiss();
                  
                  })
            }else{
                this.http.get(`${this.nestUrl}/membership/membershiphistoryinfo?parentClubKey=${this.ParentClubKey}&clubKey=${this.ClubKey}&setupKey=${this.membership.SetupKey}`).subscribe((res) => {
                    this.loading.dismiss()
                    if(res['data'].length > 0){
                        res['data'].forEach(data => {
                            if(data['allAvailableMembershipHistory'].length > 0){
                        
                                this.membershipCount = data['allAvailableMembershipHistory'].length
                                data['allAvailableMembershipHistory'].forEach(membership =>  {
                                    membership.SameGroupMember = []
                                    if(data['primaryMemberShipDetails']){
            
                                        data['primaryMemberShipDetails'][membership.primaryMembershipKey].forEach(member => {
                                            
                                            membership.SameGroupMember.push(member)
                                        });
                                    }
                                  
                                    membership.ValidityDate = moment(new Date(membership.Validity)).format('DD MMM YYYY')
                                    this.expiredMembership.push(membership)
                                });
            
                            }
                        });
                      
                      
                    }
                  
                  },
                  err =>{
                    this.loading.dismiss();
                  
                  })
            }
           
          } catch (err) {
            this.loading.dismiss();
          }
    }

    
    openActionSheet(member) {
        let actionSheet = this.actionSheetCtrl.create({
           
            buttons : this.createButtons(member)
            
        });

        actionSheet.present();
    }

    createButtons(member) {
        let buttons = [];
        let button 
        let possibleButtons = [{text: 'Manage Membership',icon:'ios-create-outline',},{text: 'Membership Details',icon:'ios-clipboard-outline',}]
 
        for (var index in possibleButtons) {
            let handler
            if(possibleButtons[index].text == 'Manage Membership'){
                handler = ()=>{
                    this.navCtrl.push('ShowmembershipPage', {
                        ParentClubKey: this.ParentClubKey,
                        ClubKey: this.ClubKey,
                        MemberKey: member.IsChild ? member.ParentKey : member.MemberKey,
                    })
                }
               
            }else if(possibleButtons[index].text == 'Membership Details'){
                handler = ()=>{
                    this.navCtrl.push('MonthlyRecord', { membership: this.membership, member: member , type:'history'})
                }
            }
            button = {
                text: possibleButtons[index].text,
                icon: possibleButtons[index].icon,
                handler: handler
              }
          buttons.push(button);
        }
        return buttons;
      }
    

    showToast(m: string, dur: number) {
        let toast = this.toastCtrl.create({
            message: m,
            duration: dur,
            position: 'bottom'
        });
        toast.present();
    }
}
