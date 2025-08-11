import { Component } from '@angular/core';
import { IonicPage, NavController,AlertController, ActionSheetController, Platform } from 'ionic-angular';

import { Storage } from '@ionic/storage';
import { FirebaseService } from '../../../services/firebase.service';
// import { IonicPage } from 'ionic-angular';
import gql from "graphql-tag";
import { GraphqlService } from '../../../services/graphql.service';
@IonicPage()
@Component({
    selector: 'page-locationsetup',
    templateUrl: 'locationsetup.html',
})
export class LocationsetupPage {
    ParentClubKey: string;
    LocationDetails = [];
    constructor(
        public alertCtrl: AlertController,
        public navCtrl: NavController,
        private fb: FirebaseService,
        public actionSheetCtrl: ActionSheetController,
        storage: Storage, 
        private platform: Platform,
        private graphqlService: GraphqlService,
    ) {
        storage.get('userObj').then((val) => {
            val = JSON.parse(val);
            if (val.$key != "") {
                this.ParentClubKey = val.UserInfo[0].ParentClubKey;
            }
        })
    }
    ionViewDidEnter() {
        this.getLocationData(this.ParentClubKey)
    }

    getLocationData(ParentClubKey) {
        this.fb.getAllWithQuery("Location/" + ParentClubKey + "/", { orderByChild: "IsActive", equalTo: true }).subscribe((data) => {
            this.LocationDetails = [];
            for (let i = data.length - 1; i >= 0; i--) {
                if (data[i].IsActive == true) {
                    this.LocationDetails.push(data[i]);
                }
            }
            console.log(this.LocationDetails);
        });

    }
    showOptions(LocationKey) {

        let actionSheet = this.actionSheetCtrl.create({
            buttons: [
                {
                    text: "Edit Location",
                    icon: this.platform.is('android') ? 'ios-create-outline' : '',
                    handler: () => {
                        this.navCtrl.push("AddlocationPage", { LocationKey: LocationKey });
                    }
                }, {
                    text: 'Delete Location',
                    cssClass: 'dangerRed',
                    icon: this.platform.is('android') ? 'trash' : '',
                    handler: () => {
                        this.deleteLocation(LocationKey)
                    }
                }
            ]
        });

        actionSheet.present();

    }
    deleteLocation(LocationKey) {
        let alert = this.alertCtrl.create({
            title: 'Delete Location',
            message: ' Are you sure to delete this Location ?',
            buttons: [
                {
                    text: "Cancel",
                    role: 'cancel'

                },
                {
                    text: 'Delete',
                    handler: data => {
                        console.log("Location/" + this.ParentClubKey + "/" + LocationKey)
                        this.fb.update(LocationKey, "Location/" + this.ParentClubKey, { IsActive: false });
                        // this.fb.deleteFromFb("Location/"+ this.ParentClubKey + "/" +LocationKey)
                        //this.removeLocationInPostgre();
                    }
                }
            ]
        });
        alert.present();
    }


    async removeLocationInPostgre(){
        try{
          const add_location_mutation = gql`
              mutation deleteLocation($locationInput: locationId!) {
                deleteLocation(locationdeleteInput: $locationInput)
              }` 
              
              const remove_location_mutation_variable = { locationInput: "" };
              this.graphqlService.mutate(add_location_mutation, remove_location_mutation_variable,0).subscribe((response)=>{
                console.log(response);
              },(err)=>{
                console.log(err);;
                //this.comonService.toastMessage("location add failed",2500,ToastMessageType.Error,ToastPlacement.Bottom);
              });            
        }catch(err){
          console.log(err);
        }       
      }

    gotoAddLocation() {
        this.navCtrl.push("AddlocationPage");
    }
}