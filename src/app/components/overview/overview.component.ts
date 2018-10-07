import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from "@angular/platform-browser";

import { BuildingService } from '../../shared/building/building.service';
import { GameService } from '../../shared/game/game.service';

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.css']
})
export class OverviewComponent implements OnInit {

  public Math: any;

  constructor( public buildingService: BuildingService, public gameService: GameService, private sanitizer: DomSanitizer) {
    this.Math = Math;
  }

  public activeBuilding;

  private buildableList = [
  {
    name: 'Small house',
    cost: 500,
    time: 1*1000,
    color: '#6BF178'
  },
  {
    name: 'Farm',
    cost: 200,
    time: 12*1000,
    color: '#FFEB6C'
  },
  {
    name: 'Factory',
    cost: 800,
    time: 7200*1000,
    color: '#8C3137'
  }];

  ngOnInit() {

    // this.gameSexrvice.gameLoop.subscribe((value) => {

    // });

    this.buildingService.activeChangedObserver.subscribe(value => {

      if (this.buildingService.activeBuilding.i != null) {
        let i = this.buildingService.activeBuilding.i;
        let j = this.buildingService.activeBuilding.j;
        let tmp = {
          i: i, j: j,
          building: this.buildingService.buildingList[i][j]
        };

        this.activeBuilding = tmp;
      } else {
        this.activeBuilding = null;
      }
    });
  }

  public void() {
    
  }

  public build(index) {
    this.buildingService.startBuilding(this.buildableList[index]);
  }

  public cancelBuilding() {
    this.buildingService.cancelBuilding();
  }

  public unsetActiveBuilding() {
    this.buildingService.unsetActive();
  }



}
