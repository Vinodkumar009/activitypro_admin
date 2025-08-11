import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

/**
 * Generated class for the TeaminvitePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-teaminvite',
  templateUrl: 'teaminvite.html',
})
export class TeaminvitePage {
  teamOne: boolean = true;
  teamTwo: boolean = true;
 
  isSelectAll = false;
  isUnselectAll = false;




  // isSelect:true;

  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad TeaminvitePage');
  }

  // selectAllToggole(){
  //   if (this.isSelectAll) {
  //     this.isUnselectAll = false;
  //     for (let loop = 0; loop < this.Members.length; loop++) {
  //         // this.Members[loop].isSelect = true;
  //     }
  // }
  // else if (!this.isSelectAll) {
  //     for (let loop = 0; loop < this.Members.length; loop++) {
  //         this.Members[loop].isSelect = false;
  //     }
  // }
  // }


  // selectAll(){
  //  this. isSelectAll=true;

  //   if(this.isSelectAll){
  //     for(let loop = 0; loop < this.Members.length; loop++){
  //       this.Members[loop].isSelect= true;
  //     }
  //     console.log(this.Members)
  //   }
  //   else{
  //     for(let loop = 0; loop < this.Members.length; loop++){
  //       this.Members[loop].isSelect= false;
  //     }
  //     console.log(this.Members)
  //   }

  // }

  selectAll(){
    // this. isSelectAll=true;
 
     if(this.isSelectAll){
      this.isUnselectAll=false;
       for(let loop = 0; loop < this.Members.length; loop++){
         this.Members[loop].isSelect= true;
       }
       console.log(this.Members)
     }
     else if(!this.isSelectAll){
       for(let loop = 0; loop < this.Members.length; loop++){
         this.Members[loop].isSelect= false;
       }
       console.log(this.Members)
     }
 
   }

   selectMembers(){

   }

  // selectAll() {

  //   // // for(let i=0;i<this.Members.length;i++){
  //   // this.isSelectAll=true;
  //   // console.log(this.Members);
  //   // // }

  //   if (this.isSelectAll) {
  //     this.isUnselectAll = false;
  //     for (let loop = 0; loop < this.Members.length; loop++) {
  //       // this.selectedMembersForTheSession[loop].isSelect = true;
  //     }
  //   }
  //   else if (!this.isSelectAll) {
  //     for (let loop = 0; loop < this.Members.length; loop++) {
  //       // this.selectedMembersForTheSession[loop].isSelect = false;
  //     }
  //   }
  // }

  changeMembers() {
    this.isSelectAll = false;
    this.isUnselectAll = false;
  }

  Members = [
    {
      Name: "Prince",
      isSelect:false
    },
    {
      Name: "Raj",
      isSelect:false
    },
    {
      Name: "Abhi",
      isSelect:false
    },
    {
      Name: "Shivam",
      isSelect:false
    },
    {
      Name: "Rahane",
      isSelect:false
    },
    {
      Name: "Dhoni",
      isSelect:false
    },
    {
      Name: "R. Sharma",
      isSelect:false
    },
    {
      Name: "Prince",
      isSelect:false
    },
    {
      Name: "Jayawardhane",
      isSelect:false
    },
    {
      Name: "Peterson",
      isSelect:false
    },
    {
      Name: "Gilchrist",
      isSelect:false
    },
    {
      Name: "Symonds",
      isSelect:false
    },
    {
      Name: "Chahal",
      isSelect:false
    },
  ]

  squadSelect(val) {
    this.teamOne = val;
    this.teamTwo = !val;
  }

  
}
