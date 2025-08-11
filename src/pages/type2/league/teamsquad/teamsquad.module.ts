import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TeamsquadPage } from './teamsquad';
 import { Component } from '@angular/core';
// import {DragDropModule} from '@angular/cdk/drag-drop'
//import { DragAndDropModule } from 'angular-draggable-droppable';




@NgModule({
  declarations: [
    TeamsquadPage,
  ],
  imports: [
    IonicPageModule.forChild(TeamsquadPage),
    
   
   // DragAndDropModule
    
  ],
})
export class TeamsquadPageModule { }
