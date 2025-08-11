import {IonicPage } from 'ionic-angular';
export interface IMember{
    ClubKey ?:string;
    CreateDate : string;
    DOB : string;
    EmailID : string;
    EmergencyContactName : string;
    EmergencyNumber:string;
    FirstName : string;
    Gender : string;
    IsAcceptTermAndCondition : boolean;
    IsActive : boolean;
    IsChild : boolean;
    IsEnable : boolean;
    IsHolidayCampMember?: boolean; 
    IsTakenConcentForm : boolean;
    LastName : string;
    MedicalCondition : string;
    MemberStatus : number;
    MiddleName : String;
    NotificationEmailAllowed : boolean;
    ParentClubKey : string; 
    Password : string;
    PhoneNumber : string;
    PromoEmailAllowed : boolean;
    SignedUpType : number;
    SignUpUnder : number;
    Source : string;
    UpdatedDate : string;
    ParentKey:string;
   }
  
  export class Member implements IMember {
    clubkey ?:string = '';
    CreateDate: string ='';
    DOB: string = '';
    EmailID: string = '';
    EmergencyContactName: string = '';
    EmergencyNumber: string = '';
    FirstName: string = '';
    Gender: string = '';
    IsAcceptTermAndCondition: boolean= true;
    IsActive: boolean;
    IsChild: boolean;
    IsEnable: boolean;
    IsHolidayCampMember: boolean;
    IsTakenConcentForm: boolean;
    LastName: string = '';
    MedicalCondition: string = '';
    MemberStatus: number;
    MiddleName: String = '';
    NotificationEmailAllowed= true;
    ParentClubKey:string;
    Password: string = '';
    PhoneNumber: string = '';
    PromoEmailAllowed=true;
    SignedUpType: number;
    SignUpUnder: number;
    Source: string = '';
    UpdatedDate: string = '';
    ParentKey:string="";
  }
  