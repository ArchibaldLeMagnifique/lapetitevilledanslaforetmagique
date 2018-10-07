import { Component } from '@angular/core';
import { BuildingService } from '../../shared/building/building.service'

@Component({
  selector: 'app-options',
  templateUrl: './options.component.html',
  styleUrls: ['./options.component.css']
})
export class OptionsComponent{

  constructor( public buildingService: BuildingService ) { }

  public clearLocalStorage() {
    localStorage.clear();
    this.buildingService.load();
    this.buildingService.unsetActive();
  }

}
