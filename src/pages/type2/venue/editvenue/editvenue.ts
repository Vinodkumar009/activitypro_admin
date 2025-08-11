import { Component } from '@angular/core';
import { NavController, PopoverController, NavParams, ToastController } from 'ionic-angular';
import { SharedServices } from '../../../services/sharedservice';
// import { PopoverPage } from '../../popover/popover';
import { FirebaseService } from '../../../../services/firebase.service';
import { Storage } from '@ionic/storage';
// import { Type2Venue } from '../venue/venue';
// import { Dashboard } from './../../dashboard/dashboard';
import {IonicPage } from 'ionic-angular';
import { CommonService, ToastMessageType, ToastPlacement } from '../../../../services/common.service';
import { HttpClient } from '@angular/common/http';
import { Apollo } from "apollo-angular";
import { HttpLink } from "apollo-angular-link-http";
import gql from "graphql-tag";

@IonicPage()
@Component({
    selector: 'editvenue-page',
    templateUrl: 'editvenue.html'
})
export class Type2EditVenue {
    nestUrl: any;
    selectedVenue: any;
    clubDets:Venue;
    clubId:string;
    VisibleatSignUpPage = 1;
    selectedParentClub: string;
    themeType: number;
    country=[]
    isVenue_available:boolean = false;
    constructor(storage: Storage, public comonService: CommonService,public toastCtrl: ToastController, public navParams: NavParams, public navCtrl: NavController,
         public sharedservice: SharedServices, 
         public fb: FirebaseService,
          public popoverCtrl: PopoverController,
          private apollo: Apollo,
          public http: HttpClient,
    ) {
      this.nestUrl = this.sharedservice.getnestURL()
      
      this.clubId = this.navParams.get("venue").ClubID;
      this.getVenue();
    //   if(this.selectedVenue.VisibleatSignUpPage){
    //     this.VisibleatSignUpPage = this.selectedVenue.VisibleatSignUpPage
    //   }
      
      this.themeType = sharedservice.getThemeType();
      storage.get('userObj').then((val) => {
        val = JSON.parse(val);
        this.selectedParentClub = val.UserInfo[0].ParentClubKey;  
        // this.fb.getAllWithQuery("/Club/Type2/" + this.selectedParentClub, {orderByKey: true, equalTo: this.selectedVenue.ClubKey} ).subscribe((data) => {
        //     if (data.length > 0){
        //         this.selectedVenue = data[0]
        //     }
        // })
        this.getCountry()
      }).catch(error => {
       // alert("Errr occured");
      });
    }



    //getting venue
  getVenue = () => {
      // //ClubDescription
        this.comonService.showLoader("Please wait");
        const challengesQuery = gql`
        query getClub($clubId:String!) {
            getClub(clubId:$clubId){
                Id
                City
                ClubContactName
                ClubName
                ClubShortName
                CountryName
                PostCode
                State
                FirebaseId
                FirstLineAddress
                SecondLineAddress
                ClubDescription
                ContactPhone
                MapUrl
                ParentClub{
                    ParentClubName
                    FireBaseId
                }
            }
        }
    `;
    this.apollo
    .query({
        query: challengesQuery,
        fetchPolicy: 'network-only',
        variables: {
            clubId:this.clubId
        },
    })
    .subscribe(({data}) => {
        console.log('challeges data' + data["getClub"]);
        this.comonService.hideLoader();
        //console.log('challeges data' + data["getChallenges"]);
        //this.commonService.toastMessage("Challenges fetched",2500,ToastMessageType.Success,ToastPlacement.Bottom);
        const club_array = data["getClub"];
        this.clubDets = club_array.length > 0 ? club_array[0] : {}
        this.isVenue_available = club_array.length > 0 ? true : false;
    },(err)=>{
        this.comonService.hideLoader();
        this.comonService.toastMessage("Venue fetch failed",2500,ToastMessageType.Error,ToastPlacement.Bottom);
    });
       
  }


    getCountry(){
        this.fb.getAll("Countries/").subscribe(data =>{
            if(data.length > 0){
                this.country = this.comonService.convertFbObjectToArray(data)
            }
        })
    }

    countryAssign(){
        this.country.forEach(eachCountry =>{
            if (eachCountry.CountryName == this.clubDets.CountryName){
                this.clubDets.CountryName = eachCountry.CountryName
            }
         })
       
    }

   
    updateVenue(){
        //this.selectedVenue['VisibleatSignUpPage'] = this.VisibleatSignUpPage
        if(this.valiateVenue()){
            let key = this.clubDets.FirebaseId
            //delete this.selectedVenue.$key
            this.fb.update(key,"/Club/Type2/" + this.selectedParentClub + "/", {
                ClubName:this.clubDets.ClubName,
                ClubShortName:this.clubDets.ClubShortName,
                ClubDescription:this.clubDets.ClubDescription,
                FirstLineAddress:this.clubDets.FirstLineAddress,
                SecondLineAddress:this.clubDets.SecondLineAddress,
                City:this.clubDets.City,
                State:this.clubDets.State,
                CountryName:this.clubDets.CountryName,
                PostCode:this.clubDets.PostCode,
                MapUrl:this.clubDets.MapUrl ? this.clubDets.MapUrl : "",
                WebsiteUrl:this.clubDets.WebsiteUrl ? this.clubDets.WebsiteUrl : "",
                Sequence:this.clubDets.sequence ? this.clubDets.sequence : 0  ,
                VisibleatSignUpPage:this.VisibleatSignUpPage,
                ContactPhone:this.clubDets.ContactPhone,
                ClubContactName:this.clubDets.ClubContactName
            });
            this.updatePostgreVenue();
        }         

  }

    valiateVenue(){
      if(!this.clubDets.FirstLineAddress ||  this.clubDets.FirstLineAddress == ''){
        this.comonService.toastMessage("Please enter firstline address",2500,ToastMessageType.Error,ToastPlacement.Bottom);
      }else if(!this.clubDets.City ||  this.clubDets.City == ''){
        this.comonService.toastMessage("Please select venue",2500,ToastMessageType.Error,ToastPlacement.Bottom);
      }else if(!this.clubDets.CountryName || this.clubDets.CountryName == ''){
        this.comonService.toastMessage("Please select country",2500,ToastMessageType.Error,ToastPlacement.Bottom);
      }else if(!this.clubDets.PostCode || this.clubDets.PostCode == ""){
        this.comonService.toastMessage("Please enter postcode",2500,ToastMessageType.Error,ToastPlacement.Bottom);
      }

      return true;
    }

    // updatePostgreVenue() {
    //     this.http.post(`${this.nestUrl}/club/updatevenue`,{
    //             PostgreId:this.clubId,
    //             ClubName:this.clubDets.ClubName,
    //             ClubShortName:this.clubDets.ClubShortName,
    //             ClubDescription:this.clubDets.ClubDescription,
    //             FirstLineAddress:this.clubDets.FirstLineAddress,
    //             SecondLineAddress:this.clubDets.SecondLineAddress,
    //             City:this.clubDets.City,
    //             State:this.clubDets.State,
    //             CountryName:this.clubDets.CountryName,
    //             PostCode:this.clubDets.PostCode,
    //             MapUrl:this.clubDets.MapUrl ? this.clubDets.MapUrl : "",
    //             Sequence:this.clubDets.sequence ? this.clubDets.sequence : 0
    //     }).subscribe((res) => {
    //       if (res['data']){
    //         this.comonService.toastMessage('Venue updated successfully', 2500, ToastMessageType.Success);
    //         this.navCtrl.pop();
    //       }
    //     },
    //       err => {
    //         this.comonService.toastMessage('Venue updation failed', 2500, ToastMessageType.Error);
    //       })
    //   }


      updatePostgreVenue() {
        const venue_updateInput = {
            PostgreId:this.clubId,
            ClubName:this.clubDets.ClubName,
            ClubShortName:this.clubDets.ClubShortName,
            ClubDescription:this.clubDets.ClubDescription,
            FirstLineAddress:this.clubDets.FirstLineAddress,
            SecondLineAddress:this.clubDets.SecondLineAddress,
            City:this.clubDets.City,
            State:this.clubDets.State,
            CountryName:this.clubDets.CountryName,
            PostCode:this.clubDets.PostCode,
            MapUrl:this.clubDets.MapUrl ? this.clubDets.MapUrl : "",
            Sequence:this.clubDets.sequence ? this.clubDets.sequence : 0,
            ContactPhone:this.clubDets.ContactPhone,
            ClubContactName:this.clubDets.ClubContactName
        }
        this.apollo
          .mutate({
            mutation: gql`
              mutation updateClub($venueInput: ClubUpdateInput!) {
                updateClub(clubUpdateInput: $venueInput) 
              }
            `,
            variables: { venueInput: venue_updateInput },
          })
          .subscribe(
            ({ data }) => {
              this.comonService.hideLoader();
              console.log("venue data" + data["updateClub"]);
              this.comonService.toastMessage("Venue updated successfully",2500,ToastMessageType.Success,ToastPlacement.Bottom);
              this.navCtrl.pop();
            },
            (err) => {
              this.comonService.hideLoader();
              console.log(JSON.stringify(err));
              this.comonService.toastMessage("Venue updation failed",2500,ToastMessageType.Error,ToastPlacement.Bottom);
            }
          );
      }

    cancelVenue() {
        this.navCtrl.pop();
    }

    validateClubInfoForReg(): boolean {
        

      if (this.selectedVenue.FirstLineAddress == "") {
          alert("Enter FirstLineAddress");
          
          return false;
      }

      else if (this.selectedVenue.City == "") {
          alert("Enter City");
          return false;
      }

      else if (this.selectedVenue.State == "") {
          alert("Enter State");
          return false;
      }


      else if (this.selectedVenue.Country == "") {
          alert("Enter Country");
          return false;
      }

  

      else if (this.selectedVenue.PostCode == "") {
          alert("Enter PostCode");
      
          return false;
      }

      return true;
  }

  showToast(m: string, dur: number) {
    let toast = this.toastCtrl.create({
      message: m,
      duration: dur,
      position: 'bottom'
    });
    toast.present();
  }

    goToDashboardMenuPage() {
        this.navCtrl.setRoot("Dashboard");
    }

}


export class Venue{
    Id:string;
    City:string;
    ClubContactName:string;
    ClubName:string;
    ClubShortName:string;
    CountryName:string;
    PostCode:string;
    State:string;
    FirebaseId:string;
    FirstLineAddress:string;
    SecondLineAddress:string;
    ClubDescription:string;
    MapUrl:string;
    sequence:number;
    WebsiteUrl?:string;
    ContactPhone:string;
    ParentClub:Parentclub
}

export class Parentclub{
    ParentClubName:string;
    FireBaseId:string;
}