import { Component } from '@angular/core';
import {Platform, NavParams, ViewController } from 'ionic-angular';
import {IonicPage } from 'ionic-angular';
@IonicPage()
@Component({
  template: `
<ion-header>
  <ion-toolbar class="toolbarheader">
    <ion-title>
      Description
    </ion-title>
    <ion-buttons start>
      <button ion-button (click)="dismiss()">
        <span ion-text color="primary" showWhen="ios">Cancel</span>
        <ion-icon name="md-close" showWhen="android,windows"></ion-icon>
      </button>
    </ion-buttons>
  </ion-toolbar>
</ion-header>
<ion-content>
  <ion-item>
        <ion-label floating>Message</ion-label>
        <ion-textarea type="text"></ion-textarea>
    </ion-item>
    <ion-grid>
        <ion-row>
            
            <ion-col width-50 >
                <button ion-button block color="danger">Cancel</button>
            </ion-col>
            <ion-col width-50 >
                <button ion-button block class="timekare-primary-btn">Create</button>
            </ion-col>
             
        </ion-row>
    </ion-grid>
</ion-content>
`
})

export class Communication_Session {
  character;

  constructor(
    public platform: Platform,
    public params: NavParams,
    public viewCtrl: ViewController
  ) {
    var characters = [
      {
        name: 'Gollum',
        quote: 'Sneaky little hobbitses!',
        image: 'assets/img/avatar-gollum.jpg',
        items: [
          { title: 'Race', note: 'Hobbit' },
          { title: 'Culture', note: 'River Folk' },
          { title: 'Alter Ego', note: 'Smeagol' }
        ]
      },
      {
        name: 'Frodo',
        quote: 'Go back, Sam! I\'m going to Mordor alone!',
        image: 'assets/img/avatar-frodo.jpg',
        items: [
          { title: 'Race', note: 'Hobbit' },
          { title: 'Culture', note: 'Shire Folk' },
          { title: 'Weapon', note: 'Sting' }
        ]
      },
      {
        name: 'Samwise Gamgee',
        quote: 'What we need is a few good taters.',
        image: 'assets/img/avatar-samwise.jpg',
        items: [
          { title: 'Race', note: 'Hobbit' },
          { title: 'Culture', note: 'Shire Folk' },
          { title: 'Nickname', note: 'Sam' }
        ]
      }
    ];
    this.character = characters[this.params.get('charNum')];
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }
}