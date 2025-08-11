export class Mandates{
    MandatesName:string = "";
    FirstName:string = "";
    LastName:string = "";
    Email:string = "";
    FirstLineAddres:string = "";
    SecondLineAddress:string = "";
    City:string = "";
    Country:string = "";
    PostCode:string = "";
    Phone:any = "";
    CreatedDate:number;
    UpdatedDate:number;
    IsEnable:boolean = true;
    IsActive:boolean = true;
    Gender:string = "";
    SessionToken:string = "";
    Status:any = 1;
    ActivityName:string;
    ActivityKey:string;
    //1 -> initiated
    //2 -> inntermidiate
    //3 -> finish
    constructor(memberObj:any){
        this.FirstName = memberObj["FirstName"];
        this.LastName = memberObj["LastName"];
        this.Email = memberObj["EmailID"];
        this.Phone = memberObj["PhoneNumber"];
        this.Gender = memberObj["Gender"];
        this.ActivityName = memberObj["ActivityName"];
        this.ActivityKey = memberObj["ActivityKey"];
    }
}