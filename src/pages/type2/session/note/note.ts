import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { FirebaseService } from '../../../../services/firebase.service';


/**
 * Generated class for the NotePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-note',
  templateUrl: 'note.html',
})
export class NotePage {
  memberInfo:any = "";
  sessionDetails:any = "";
  noteObj:NoteDetails = new NoteDetails();
  noteDetails:Array<any> = [];
  constructor(public navCtrl: NavController, public navParams: NavParams,public fb: FirebaseService) {
  }
  ionViewDidLoad() {
   this.memberInfo = this.navParams.get('memberInfo');
   this.sessionDetails = this.navParams.get('sessionDetails');
   this.getNoteDetails();
  }
 
  getNoteDetails(){
    this.fb.getAllWithQuery("Note/"+this.memberInfo.ParentClubKey+"/"+this.memberInfo.ClubKey,{orderByChild:'IsActive',equalTo:true}).subscribe((data) =>{
      this.noteDetails = [];
      for(let i = 0 ; i  < data.length ;i++){
        if(data[i].MemberKey == this.memberInfo.Key && data[i].SessionKey == this.sessionDetails.$key){
          data[i]['IsShow'] = false;
          this.noteDetails.push(data[i])
        }
      }
      this.noteDetails  =this.noteDetails.reverse();
    })
  }
  show(note){
    note.IsShow = !note.IsShow;
  }
}
class NoteDetails{
  Notes:String = "";
  NotesAddedBy:String = "";
  NotesCreatedOn:String = "";
  MemberKey:String = "";
  MemberParentKey:String = "";
  SessionKey:String = "";
  ParentClubKey:String = "";
  VenueKey:String = "";
  ActivityKey:String = "";
  IsActive:boolean = true;
  IsEnable:boolean =true;
  UpdatedBy:String = "";
  CreatedBy:String = "";
}