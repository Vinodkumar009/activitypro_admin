import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { FirebaseService } from '../../../../../services/firebase.service';
import { CommonService } from '../../../../../services/common.service';
import * as moment from 'moment';
import { clamp } from 'ionic-angular/util/util';
/**
 * Generated class for the HolidaycampaymentsdetailsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-holidaycampaymentsdetails',
  templateUrl: 'holidaycampaymentsdetails.html',
})
export class HolidaycampaymentsdetailsPage {
  memberInfo:any = "";
  transactionKey = "";
  paymentInfo:any = "";
  discounts:Array<any> = [];
  payDate:any = "";
  selectedcamp:any = "";
  transactionArray:Array<any> = [];
  paymentDate:any = "";
  tranactionDetailsArray:Array<TransactionDetails> = [];
  constructor(public commonService:CommonService,public navCtrl: NavController, public navParams: NavParams, public fb: FirebaseService) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad HolidaycampaymentsdetailsPage');
    this.memberInfo = this.navParams.get('info');
    this.paymentDate = moment(this.memberInfo.TransactionDate).format('DD-MM-YYYY');
    console.log(this.memberInfo);
    this.countTransaction();
    
  }
  countTransaction(){
    if(this.memberInfo.TransactionNo != undefined){
      this.transactionArray.push(this.memberInfo.TransactionNo);
    }
    if(this.memberInfo.Transaction != undefined){
      if(this.memberInfo.Transaction.length == undefined){
        this.memberInfo.Transaction = this.commonService.convertFbObjectToArray( this.memberInfo.Transaction);
      }
      for(let i = 0 ; i < this.memberInfo.Transaction.length ;i++){
        this.transactionArray.push(this.memberInfo.Transaction[i].TransactionNo);
      }
    }
    this.getPaymentDetails();
  }
  getPaymentDetails(){
    for(let traction = 0 ; traction < this.transactionArray.length ;  traction++){
      this.fb.getAllWithQuery("PaymentGatewayInfo/HolidayCamp",{orderByKey:true,equalTo:this.transactionArray[traction]}).subscribe((data)=>{
        let tranactionObj = new TransactionDetails();
        this.discounts = [];
        this.selectedcamp = {};
         
         if(data[0].SessionDetails != undefined){
           if(data[0].SessionDetails.length == undefined){
            this.selectedcamp = "";
            this.discounts = [];
            data[0].SessionDetails = this.commonService.convertFbObjectToArray(data[0].SessionDetails);
            for(let camp = 0 ; camp <  data[0].SessionDetails.length ; camp++){
              this.selectedcamp = "";
              this.discounts = [];
              if( data[0].SessionDetails[camp].CampKey == this.memberInfo.CampKey && data[0].SessionDetails[camp].MemberKey == this.memberInfo.Key ){
                this.selectedcamp = data[0].SessionDetails[camp];
                this.selectedcamp.Discount = this.commonService.convertFbObjectToArray(  this.selectedcamp.Discount);
                this.payDate =  moment(this.selectedcamp.PaymentDate).format('DD-MM-YYYY');
                 for(let i = 0 ;i <   this.selectedcamp.Discount.length ;i++){
                   this.discounts.push( this.selectedcamp.Discount[i]);
               }
              }
              tranactionObj.transactionNumber = this.transactionArray[traction].TransactionNo;
              tranactionObj.paymentDate = this.payDate;
              tranactionObj.tranactionDetails = data[0];
              tranactionObj.tranactionDetailsOfThisCamp = this.selectedcamp;
              tranactionObj.discounts =this.discounts;
              this.tranactionDetailsArray.push(tranactionObj);
            }
           }
         }
         this.selectedcamp = "";
         this.discounts = [];
         if(data[0].CampDetails != undefined){
           if(data[0].CampDetails.length == undefined){
            data[0].CampDetails = this.commonService.convertFbObjectToArray( data[0].CampDetails);
           }
           for(let camp = 0 ; camp <  data[0].CampDetails.length ; camp++){
            this.selectedcamp = "";
            this.discounts = [];
             if( data[0].CampDetails[camp].CampKey == this.memberInfo.CampKey && data[0].CampDetails[camp].MemberKey == this.memberInfo.Key ){
               this.selectedcamp = data[0].CampDetails[camp];
               this.selectedcamp.Discount = this.commonService.convertFbObjectToArray(  this.selectedcamp.Discount);
               this.payDate =  moment(this.selectedcamp.PaymentDate).format('DD-MM-YYYY');
                for(let i = 0 ;i <   this.selectedcamp.Discount.length ;i++){
                  this.discounts.push( this.selectedcamp.Discount[i]);
              }
             }
             tranactionObj.transactionNumber = this.transactionArray[traction].TransactionNo;
             tranactionObj.paymentDate = this.payDate;
             tranactionObj.tranactionDetails = data[0];
             tranactionObj.tranactionDetailsOfThisCamp = this.selectedcamp;
             tranactionObj.discounts =this.discounts;
             this.tranactionDetailsArray.push(tranactionObj);
           }
         }
        
       });
    }
   
  }
  getDateCustom(val){
    return moment(val).format('dd-mm-yyyy');
  }
}

class TransactionDetails{
  tranactionDetails:any = "";
  discounts:Array<any> = [];
  paymentDate:any = "";
  transactionNumber = "";
  tranactionDetailsOfThisCamp = "";
}