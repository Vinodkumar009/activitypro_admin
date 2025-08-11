import { Component } from '@angular/core';

/**
 * Generated class for the AddmembertoleagueComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'addmembertoleague',
  templateUrl: 'addmembertoleague.html'
})
export class AddmembertoleagueComponent {

  text: string;

  constructor() {
    console.log('Hello AddmembertoleagueComponent Component');
    this.text = 'Hello World';
  }

}
