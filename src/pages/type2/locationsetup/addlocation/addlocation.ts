import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams,ToastController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { FirebaseService } from '../../../../services/firebase.service';
import { SharedServices } from '../../../services/sharedservice';
import { CommonService, ToastMessageType, ToastPlacement } from '../../../../services/common.service';
import { HttpClient } from '@angular/common/http';
// import { IonicPage } from 'ionic-angular';
import gql from "graphql-tag";
import { AddLocationModel, ILocation } from '../model/location.model';
import { GraphqlService } from '../../../../services/graphql.service';
@IonicPage()
@Component({
  selector: 'page-addlocation',
  templateUrl: 'addlocation.html',
})
export class AddlocationPage {

  ParentClubKey: string;
  postCode: number;
  location:ILocation = {
    Name: '',
    Address1: '',
    Address2: '',
    City: '',
    PostCode: 0,
    IsActive: true,
    IsEnable: true,
    CreationDate: (new Date()).getTime(),
    UpdationDate: (new Date()).getTime(),
    MapURL: '',
    WebsiteURL: '',
    Note: '',
    MapLatitude: '',
    MapLongitude: ''
  };

  facilitiesArr = [
    { Label: 'Bar', Value: false, IsActive: true, Key: "" },
    { Label: 'WC', Value: false, IsActive: true, Key: "" },
    { Label: 'Drinking Water', Value: false, IsActive: true, Key: "" },
    { Label: 'Resturant', Value: false, IsActive: true, Key: "" },
    { Label: 'Disabled Friendly', Value: false, IsActive: true, Key: "" },
    { Label: 'Baby Change', Value: false, IsActive: true, Key: "" },
    { Label: 'Parking', Value: false, IsActive: true, Key: "" },
  ]
  location_input:AddLocationModel;
  // Facilities: any;
  locationKey: string;
  dataExists = false;
  facilitiesDataExists = false;
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public toastCtrl: ToastController,
    private fb: FirebaseService,
    public comonService: CommonService,
    public sharedservice: SharedServices,
    public http: HttpClient,
    storage: Storage,
    private graphqlService: GraphqlService,
  ) {
    storage.get('userObj').then((val) => {
      val = JSON.parse(val);
      if (val.$key != "") {
        this.ParentClubKey = val.UserInfo[0].ParentClubKey;
      }
      

      if (this.navParams.get("LocationKey")) {
        this.locationKey = this.navParams.get("LocationKey");
        this.dataExists = true;
        // console.log(this.locationKey)
        this.getLocationData(this.ParentClubKey, this.locationKey);
      }
    })
  }

  getLocationData(ParentClubKey, locationKey) {
    this.fb.getAllWithQuery("Location/" + ParentClubKey + "/", { orderByKey: true, equalTo: locationKey }).subscribe((data) => {

      this.location.Name = data[0].Name;
      this.location.Address1 = data[0].Address1;
      this.location.Address2 = data[0].Address2;
      this.location.City = data[0].City;
      this.location.IsActive = data[0].IsActive;
      this.location.IsEnable = data[0].IsEnable;
      this.location.CreationDate = data[0].CreationDate;
      this.location.MapURL = data[0].MapURL;
      this.location.WebsiteURL = data[0].WebsiteURL;
      this.location.Note = data[0].Note;
      this.postCode = data[0].PostCode;

      if (data[0].Facilities != undefined) {
        this.facilitiesArr = [];
        this.facilitiesArr = this.comonService.convertFbObjectToArray(data[0].Facilities);
        this.facilitiesDataExists = true;
      }
      console.log(this.location, this.facilitiesArr);
    });
  }

  selectFacility(facilities) {
    facilities.Value = !facilities.Value;
  }

  addLocation() {
    if (this.location.Name && this.location.City && this.location.Address1 && this.postCode) {
      this.http.post(`${this.sharedservice.getnestURL()}/location/getplacedetails`,
        {
          addressList: [{
            firstLineAddress: this.location.Name + "," + this.location.Address1 + "," + this.location.Address2,
            postCode: this.postCode,
            state: this.location.City
          }]
        }

      ).subscribe((res: any) => {
        if(Object.keys(res).length > 0){
          this.location.MapLatitude = res.data[0].MapDetails.location.lat;
          this.location.MapLongitude = res.data[0].MapDetails.location.lng;
          this.location.PostCode = this.postCode;
          let locationKey = this.fb.saveReturningKey("Location/" + this.ParentClubKey, this.location)
          this.facilitiesArr.forEach(element => {
            this.fb.save({ Label: element.Label, Value: element.Value, IsActive: element.IsActive }, "Location/" + this.ParentClubKey + "/" + this.locationKey + "/Facilities")
          })
          console.log(this.location, this.facilitiesArr);
          this.comonService.toastMessage('Location Added',2500,ToastMessageType.Success,ToastPlacement.Bottom);
          this.saveLocationInPostgre();
          //this.navCtrl.pop();
        }else{
          this.comonService.toastMessage('Failed fetch location details',2500,ToastMessageType.Error,ToastPlacement.Bottom);
        }
        
      },(err)=>{
        this.comonService.toastMessage('Failed fetch location details',2500,ToastMessageType.Error,ToastPlacement.Bottom);
      });
     
    } else {
      this.comonService.toastMessage('Please enter address details',2500,ToastMessageType.Error);
    }
  }

  async saveLocationInPostgre(){
    try{
      this.location_input = new AddLocationModel(this.location);
      this.location_input.ParentClubID = this.sharedservice.getPostgreParentClubId();
      for(const facility of this.facilitiesArr){
        switch(facility.Label){
          case "Bar":
            this.location_input.is_bar_available = facility.Value;
            break;
          case "WC":
            this.location_input.is_wc_available = facility.Value;
            break;
          case "Drinking Water":
            this.location_input.is_drinking_water = facility.Value;
            break;
          case "Resturant":
            this.location_input.is_resturant = facility.Value;
            break;
          case "Disabled Friendly":
            this.location_input.is_disabled_friendly = facility.Value;
            break;
          case "Baby Change":
            this.location_input.is_baby_change = facility.Value;
            break;
          case "Parking":
            this.location_input.is_parking_available = facility.Value;
            break;
        }
      }
      
      console.log(this.location_input);
  
      const add_location_mutation = gql`
          mutation saveLocation($locationInput: LocationInput!) {
            saveLocation(locationCreateInput: $locationInput){
                  id
                  map_url
                  name
                  note
                  post_code
              }
          }` 
          
          const add_location_mutation_variable = { locationInput: this.location_input };
          this.graphqlService.mutate(add_location_mutation, add_location_mutation_variable,0).subscribe((response)=>{
            console.log(response);
          },(err)=>{
            console.log(err);;
            //this.comonService.toastMessage("location add failed",2500,ToastMessageType.Error,ToastPlacement.Bottom);
          });            
    }catch(err){
      console.log(err);
    }       
  }


  updateLocation() {
    if (this.location.Name && this.location.City && this.location.Address1 && this.postCode) {
      this.http.post(`${this.sharedservice.getnestURL()}/location/getplacedetails`,
        {
          addressList: [{
            firstLineAddress: this.location.Name + "," + this.location.Address1 + "," + this.location.Address2,
            postCode: this.postCode,
            state: this.location.City
          }]
        }).subscribe((res: any) => {
        if(Object.keys(res).length > 0){
          this.location.MapLatitude = res.data[0].MapDetails.location.lat;
          this.location.MapLongitude = res.data[0].MapDetails.location.lng;
          this.location.PostCode = this.postCode;
          this.fb.update(this.locationKey, "Location/" + this.ParentClubKey, this.location);
          if (this.facilitiesDataExists) {
            this.facilitiesArr.forEach(element => {
              this.fb.update(element.Key, "Location/" + this.ParentClubKey + "/" + this.locationKey + "/Facilities", { Label: element.Label, Value: element.Value, IsActive: element.IsActive });
            });
          } else {
            this.facilitiesArr.forEach(element => {
              this.fb.save({ Label: element.Label, Value: element.Value, IsActive: element.IsActive }, "Location/" + this.ParentClubKey + "/" + this.locationKey + "/Facilities")
            })
          }
          console.log(this.location, this.facilitiesArr);
          this.comonService.toastMessage(this.location.Name + " Location updated",2500,ToastMessageType.Success)
          this.navCtrl.pop();
        }else{
          this.comonService.toastMessage('Failed fetch location details',2500,ToastMessageType.Error,ToastPlacement.Bottom);
        }
        
      })
    }

   
  }
  

}
