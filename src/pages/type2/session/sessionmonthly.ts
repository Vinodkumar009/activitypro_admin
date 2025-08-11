import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController, AlertController } from 'ionic-angular';
import moment, { Moment } from 'moment';
import { FirebaseService } from '../../../services/firebase.service';
import { Storage } from '@ionic/storage';
/**
 * Generated class for the SessioninstallmentPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */
// {SessionDetailsObject:this.sessionDetails,InstallmentSesionObject:this.installmentSessionObj}
@IonicPage()
@Component({
  selector: 'page-sessionmonthly',
  templateUrl: 'sessionmonthly.html',
})
export class SessionMonthly {
  sessionDetailsObject: any;
  monhtlySesionObject: any;
  installments = [];
  term: any;

  currencyDetails: any;
  maxDate: string = "";
  constructor(storage: Storage, public fb: FirebaseService, private toastCtrl: ToastController, public navCtrl: NavController, public navParams: NavParams,
    public alertCtrl: AlertController) {
    this.sessionDetailsObject = navParams.get('SessionDetailsObject');


    this.sessionDetailsObject.PaymentOption = parseInt(this.sessionDetailsObject.PaymentOption);
    storage.get('Currency').then((val) => {
      this.currencyDetails = JSON.parse(val);
    }).catch(error => {

    });
    if (this.sessionDetailsObject != undefined) {
      this.monhtlySesionObject = navParams.get('MonthlySessionObject');
      //   this.term = navParams.get("Term");

      //   this.maxDate = (((new Date().getFullYear()) + 10) + "-" + 12 + "-" + 31).toString();

      //   for (let i = 0; i < this.installmentSesionObject.NoOfInstallment; i++) {
      //     let installmentDate: any;

      //     installmentDate = ((i == 0) ? moment(this.term.TermStartDate) : moment(this.installments[i - 1].InstallmentDate).add(2, 'months'));
      //     installmentDate = moment(installmentDate).format("YYYY-MM-DD");

      //     this.installments.push({
      //       InstallmentName: "Installment " + (i + 1),
      //       InstallmentAmountForMember: this.installmentSesionObject.InstallmentAmountForMember,
      //       InstallmentAmountForNonMember: this.installmentSesionObject.InstallmentAmountForNonMember,
      //       InstallmentDate: installmentDate,
      //       EarlyPaymentDate: installmentDate,
      //       Comments: "",
      //       IsActive: true
      //     });
    }




  }

  ionViewDidLoad() {

    console.log('ionViewDidLoad SessioninstallmentPage');
  }
  cancelSessionCreation() {
    this.navCtrl.pop();
  }




  createSession() {

    let confirm = this.alertCtrl.create({
      title: 'Create Monthly Group',
      message: 'Are you sure you want to create the session?',
      buttons: [
        {
          text: 'No',
          handler: () => {

          }
        },
        {
          text: 'Yes',
          handler: () => {
              this.createMonthlySession();
          }
        }
      ]
    });
    confirm.present();

  }




  createMonthlySession() {

    this.monhtlySesionObject.ActivityCategoryKey = this.sessionDetailsObject.ActivityCategoryKey;
    this.monhtlySesionObject.ActivityKey = this.sessionDetailsObject.ActivityKey;
    this.monhtlySesionObject.ActivitySubCategoryKey = this.sessionDetailsObject.ActivitySubCategoryKey;
    this.monhtlySesionObject.ClubKey = this.sessionDetailsObject.ClubKey;
    this.monhtlySesionObject.CoachKey = this.sessionDetailsObject.CoachKey;
    this.monhtlySesionObject.CoachName = this.sessionDetailsObject.CoachName;
    this.monhtlySesionObject.Comments = this.sessionDetailsObject.Comments;
    this.monhtlySesionObject.Days = this.sessionDetailsObject.Days;
    this.monhtlySesionObject.EndDate = this.sessionDetailsObject.EndDate;
    this.monhtlySesionObject.FinancialYearKey = this.sessionDetailsObject.FinancialYearKey;
    this.monhtlySesionObject.GroupSize = this.sessionDetailsObject.GroupSize;
    this.monhtlySesionObject.IsActive = this.sessionDetailsObject.IsActive;
    if(this.sessionDetailsObject.IsAllMembertoEditAmendsFees == undefined){
      this.monhtlySesionObject.IsAllMembertoEditAmendsFees = true;
    }else{
      this.monhtlySesionObject.IsAllMembertoEditAmendsFees = this.sessionDetailsObject.IsAllMembertoEditAmendsFees;
    }
    //this.monhtlySesionObject.IsAllMembertoEditFees = this.sessionDetailsObject.IsAllMembertoEditFees;
    this.monhtlySesionObject.IsExistActivityCategory = this.sessionDetailsObject.IsExistActivityCategory;
    this.monhtlySesionObject.IsExistActivitySubCategory = this.sessionDetailsObject.IsExistActivitySubCategory;
    this.monhtlySesionObject.IsTerm = this.sessionDetailsObject.IsTerm;
    this.monhtlySesionObject.NoOfWeeks = this.sessionDetailsObject.NoOfWeeks;
    this.monhtlySesionObject.GroupStatus = this.sessionDetailsObject.GroupStatus;
    this.monhtlySesionObject.ParentClubKey = this.sessionDetailsObject.ParentClubKey;
    this.monhtlySesionObject.PaymentOption = this.sessionDetailsObject.PaymentOption;

    // this.installmentSesionObject.SessionFee
    this.monhtlySesionObject.SessionName = this.sessionDetailsObject.SessionName;
    this.monhtlySesionObject.SessionType = this.sessionDetailsObject.SessionType;
    this.monhtlySesionObject.StartDate = this.sessionDetailsObject.StartDate;
    this.monhtlySesionObject.StartTime = this.sessionDetailsObject.StartTime;
    this.monhtlySesionObject.TermKey = this.sessionDetailsObject.TermKey;

    console.log(this.monhtlySesionObject);

    // //session create
    // let returnkey = this.fb.saveReturningKey("/Session/" + this.installmentSesionObject.ParentClubKey + "/" + this.installmentSesionObject.ClubKey + "/" + this.installmentSesionObject.CoachKey + "/" + this.installmentSesionObject.SessionType + "/", this.installmentSesionObject);
    // ////navigate to add member to session
    // for (let i = 0; i < this.installments.length; i++) {
    //   this.fb.saveReturningKey("/Session/" + this.installmentSesionObject.ParentClubKey + "/" + this.installmentSesionObject.ClubKey + "/" + this.installmentSesionObject.CoachKey + "/" + this.installmentSesionObject.SessionType + "/" + returnkey + "/Installment/", this.installments[i]);
    // }

    // this.fb.update((returnkey.toString()), "/Coach/Type2/" + this.installmentSesionObject.ParentClubKey + "/" + this.installmentSesionObject.CoachKey + "/Session/", this.installmentSesionObject);



    // let message = "Session Created successfully.Please add member to the session.";
    // this.showToast(message, 3000);
    // this.navCtrl.pop();
    // this.navCtrl.pop();






  }

  showToast(m: string, d: number) {
    let toast = this.toastCtrl.create({
      message: m,
      duration: d,
      position: 'bottom'
    });
    toast.present();
  }


  onChangeOfMemberAmount() {
    // this.installmentSesionObject.FullInstallmentAmountForMember = "0.00";
    // for (let i = 0; i < this.installments.length; i++) {
    //   let calculateAmount = parseFloat(this.installments[i].InstallmentAmountForMember) + parseFloat(this.installmentSesionObject.FullInstallmentAmountForMember);
    //   if (!isNaN(calculateAmount)) {
    //     this.installmentSesionObject.FullInstallmentAmountForMember = calculateAmount.toFixed(2);
    //   }
    // }
  }


  onChangeOfNonMemberAmount() {
    // this.installmentSesionObject.FullInstallmentAmountForNonMember = "0.00";
    // for (let i = 0; i < this.installments.length; i++) {
    //   let calculateAmount = parseFloat(this.installments[i].InstallmentAmountForNonMember) + parseFloat(this.installmentSesionObject.FullInstallmentAmountForNonMember);
    //   if (!isNaN(calculateAmount)) {
    //     this.installmentSesionObject.FullInstallmentAmountForNonMember = calculateAmount.toFixed(2);
    //   }
    // }
  }






}
