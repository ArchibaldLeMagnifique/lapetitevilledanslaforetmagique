import { Injectable} from '@angular/core';
import { Subject } from 'rxjs';
import { GameService } from '../game/game.service';

@Injectable({
  providedIn: 'root'
})
export class BuildingService {

  constructor( public gameService: GameService ) {
    this.load();
    this.gameService.gameLoop.subscribe((value) => { this.checkBuildings(); });
    this.gameService.listenForSave().subscribe((value) => { this.save() });
  }

  public save() {
    localStorage.setItem("buildingList", JSON.stringify(this.buildingList));
    localStorage.setItem("isBuildingList", JSON.stringify(this.isBuildingList));
  }

  public load() {
    if (localStorage.getItem("buildingList")) {
      this.buildingList = JSON.parse(localStorage.getItem("buildingList"));
    } else {
      this.initTown();
      this.save();
    }
    if (localStorage.getItem("isBuildingList") && localStorage.getItem("isBuildingList") != 'undefined') {
      this.isBuildingList = JSON.parse(localStorage.getItem("isBuildingList"));
    }

  }

  public buildingList = [];
  public isBuildingList = [];

  public activeBuilding = {i: null, j: null};
  public overbuilding = {i: null, j: null};

  public activeChangedObserver = new Subject();

  public initTown() {
    this.buildingList = [];

    function findAngleThatFits(list, marge) {
      let angle = Math.random() * 2 * Math.PI;
      for (let i=0; i<list.length; i++) {
        let distance = Math.abs(list[i] - angle);
        if ((distance < marge) || ((2*Math.PI - distance) < marge))
          return findAngleThatFits(list, marge);
      }
      return angle;
    }

    // create initial buildings
    for(let i=0; i<5; i++) {
      let angleList = [];
      let angle = Math.random() * 2 * Math.PI;
      angleList.push(angle);
      for (let j=0; j<7 + i; j++) {
        angleList.push(findAngleThatFits(angleList, Math.PI / (12+2*i)));
      }
      angleList.sort();

      let circle = [];
      let type;
      (i==0) ? type='buildable' : type='free';
      for (let j=0; j<angleList.length-1; j++) {
        circle.push({building: {type: type}, begin: angleList[j], size: angleList[j+1] - angleList[j]})
      }
      circle.push({building: {type: type}, begin: angleList[angleList.length-1], size: angleList[0] - angleList[angleList.length-1] + 2 * Math.PI});

      this.buildingList.push(circle);
    }
    
  }

  public startBuilding(building) {
    let ichanged = this.activeBuilding.i;
    let jchanged = this.activeBuilding.j;
    let newBuilding = {
      name: building.name,
      cost: building.cost,
      time: building.time,
      color: building.color,
      startTime: Date.now(),
      nowTime: Date.now(),
      i: ichanged,
      j: jchanged
    }
    
    this.buildingList[ichanged][jchanged].building = newBuilding;
    this.isBuildingList.push(newBuilding);
    this.gameService.save();
    this.gameService.redraw();
  }

  public cancelBuilding() {
    this.buildingList[this.activeBuilding.i][this.activeBuilding.j].building = {type: 'buildable'};
    for(let i=0; i<this.isBuildingList.length; i++) {
      if (this.isBuildingList[i].i == this.activeBuilding.i && this.isBuildingList[i].j == this.activeBuilding.j) {
        this.isBuildingList.splice(i, 1);
        this.gameService.save();
        this.gameService.redraw();
        return;
      }
    }
  }

  public checkBuildings() {
    for(let i=0; i<this.isBuildingList.length; i++) {
      this.buildingList[this.isBuildingList[i].i][this.isBuildingList[i].j].building.nowTime = Date.now();
      if ((Date.now() - this.isBuildingList[i].startTime) / this.isBuildingList[i].time >= 1) {
        this.newBuilding(this.isBuildingList[i].i, this.isBuildingList[i].j);
        delete this.buildingList[this.isBuildingList[i].i][this.isBuildingList[i].j].building.startTime;
        delete this.buildingList[this.isBuildingList[i].i][this.isBuildingList[i].j].building.nowTime;
        this.isBuildingList.splice(i, 1);
        this.gameService.save();
        this.gameService.redraw();
      } else {
        if (i==0) this.gameService.redraw();
      }
    }
  }

  public newBuilding(ichanged, jchanged) {
    let l = this.buildingList;
    if(l[ichanged+1]){
      for (let j=0; j<l[ichanged+1].length; j++) {
        if (((l[ichanged][jchanged].begin > l[ichanged+1][j].begin &&
              l[ichanged][jchanged].begin < l[ichanged+1][j].begin + l[ichanged+1][j].size) ||
             (l[ichanged][jchanged].begin + l[ichanged][jchanged].size > l[ichanged+1][j].begin &&
              l[ichanged][jchanged].begin + l[ichanged][jchanged].size < l[ichanged+1][j].begin + l[ichanged+1][j].size)) ||
             (l[ichanged][jchanged].begin + 2*Math.PI > l[ichanged+1][j].begin &&
              l[ichanged][jchanged].begin + 2*Math.PI < l[ichanged+1][j].begin + l[ichanged+1][j].size) ||
            ((l[ichanged+1][j].begin > l[ichanged][jchanged].begin &&
              l[ichanged+1][j].begin < l[ichanged][jchanged].begin + l[ichanged][jchanged].size) ||
             (l[ichanged+1][j].begin + l[ichanged+1][j].size > l[ichanged][jchanged].begin &&
              l[ichanged+1][j].begin + l[ichanged+1][j].size < l[ichanged][jchanged].begin + l[ichanged][jchanged].size)) ||
             (l[ichanged+1][j].begin > l[ichanged][jchanged].begin - 2*Math.PI &&
              l[ichanged+1][j].begin < l[ichanged][jchanged].begin + l[ichanged][jchanged].size - 2*Math.PI)) {
          if (l[ichanged+1][j].building.type == 'free') l[ichanged+1][j].building.type = 'buildable';
        }
      }
    }
    let m = l[ichanged].length;
    if (l[ichanged][((jchanged-1) % m + m) % m].building.type == 'free')
      l[ichanged][((jchanged-1) % m + m) % m].building.type = 'buildable';
    if (l[ichanged][((jchanged+1) % m + m) % m].building.type == 'free')
      l[ichanged][((jchanged+1) % m + m) % m].building.type = 'buildable';
    this.gameService.redraw();
  }

  public findBuildingByAngle(angle, i) {
    if (angle < this.buildingList[i][0].begin) return this.buildingList[i].length-1;
    for (let j=0; j<this.buildingList[i].length; j++) {
      if(angle > this.buildingList[i][j].begin && angle < this.buildingList[i][j].begin + this.buildingList[i][j].size) {
        return j;
      }
    }
  }

  public setActive() {
    this.activeBuilding.i = this.overbuilding.i;
    this.activeBuilding.j = this.overbuilding.j;
    this.activeChangedObserver.next();
  }

  public unsetActive() {
    this.activeBuilding = {i:null, j:null};
    this.activeChangedObserver.next();
  }

  public setOver(c) {
    for (let i=0; i<5; i++) {
      if (c.distance > 45 * (i+1.5) - 20 && c.distance < 45 * (i+1.5) + 20) {
        let j = this.findBuildingByAngle(c.angle, i);
        if (this.buildingList[i][j].building.type == 'free'){
          this.overbuilding.i = null;
          return;
        }
        this.overbuilding.i = i;
        this.overbuilding.j = j;
        return;
      }
    }
    this.overbuilding.i = null;
  }
}
