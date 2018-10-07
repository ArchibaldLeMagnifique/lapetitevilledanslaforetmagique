import { Component, ElementRef, ViewChild, AfterViewInit, Input } from '@angular/core';
import { fromEvent } from 'rxjs';
import { BuildingService } from '../../building/building.service';
import { GameService } from '../../game/game.service';

@Component({
  selector: 'wheel',
  templateUrl: './wheel.component.html',
  styleUrls: ['./wheel.component.css']
})
export class WheelComponent implements AfterViewInit  {
  @ViewChild('myCanvas') canvas: ElementRef;

  @Input() size: number;

  private cx: CanvasRenderingContext2D;

  private mouse = {x: 0, y: 0};

  private forest = [];

  constructor( public buildingService: BuildingService, public gameService: GameService ) { }

  ngAfterViewInit() {
    const canvasEl: HTMLCanvasElement = this.canvas.nativeElement;
    this.cx = canvasEl.getContext('2d');

    canvasEl.width = this.size;
    canvasEl.height = this.size;

    this.gameService.listenForRedraw().subscribe((value) => {
      this.redraw();
    });

    for(let i=0; i<Math.PI; i+=Math.PI/24) {
      this.forest.push(Math.random()*50+50);
    }

    this.redraw();
    this.captureEvents(canvasEl);
  }

  private redraw() {
    // background
    this.cx.beginPath();
    this.cx.fillStyle = "#968361"; 
    this.cx.fillRect(0,0,this.size,this.size); 

    // middle
    this.cx.beginPath();
    this.cx.arc(this.size/2, this.size/2, 40, 0, 2* Math.PI);
    this.cx.fillStyle = '#F7FFF7';
    this.cx.fill();

    // town
    let buildingList = this.buildingService.buildingList;

    for(let i=0; i<buildingList.length; i++) {
      for(let j=0; j<buildingList[i].length; j++) {
        let r = 45 * (i+1.5);

        switch (buildingList[i][j].building.type) {
          case 'buildable':
            this.cx.strokeStyle = '#FFFFFF';
            this.cx.globalAlpha = 0.6;
            break;
          case 'free':
            this.cx.strokeStyle = '#FFFFFF';
            this.cx.globalAlpha = 0.2;
            break;
          default:
            this.cx.strokeStyle = buildingList[i][j].building.color;
            this.cx.globalAlpha = 1;
            if (buildingList[i][j].building.startTime) 
              this.cx.globalAlpha = 0.4;
        }
        // building
        this.cx.beginPath();
        this.cx.lineWidth = 40;
        this.cx.arc(this.size/2, this.size/2, r, buildingList[i][j].begin+0.01, buildingList[i][j].begin + buildingList[i][j].size-0.01);
        this.cx.stroke();
        if (this.cx.globalAlpha == 0.4) {
          this.cx.globalAlpha = 1;
          let progress = (Date.now() - buildingList[i][j].building.startTime) / buildingList[i][j].building.time;
          if (progress > 0) {
            this.cx.beginPath();
            this.cx.lineWidth = 40 * progress;
            this.cx.arc(this.size/2, this.size/2, r + 20*progress - 20, buildingList[i][j].begin+0.01, buildingList[i][j].begin + buildingList[i][j].size-0.01);
            this.cx.stroke();
            this.cx.fillStyle = "#000";
            this.cx.textAlign = "center";
            this.cx.textBaseline = "middle";
            this.cx.font = "bold 10pt Arial";
            this.cx.fillText(Math.floor(progress*100).toString()+"%", this.size/2 + r * Math.cos(buildingList[i][j].begin+buildingList[i][j].size/2), this.size/2 + r * Math.sin(buildingList[i][j].begin+buildingList[i][j].size/2)); 
          }
        }
        this.cx.globalAlpha = 1;

        // mouse over
        if (this.buildingService.overbuilding.i == i && this.buildingService.overbuilding.j == j) {
          this.cx.beginPath();
          this.cx.strokeStyle = '#ffffff';
          this.cx.lineWidth = 2;
          this.cx.arc(this.size/2, this.size/2, r-20, buildingList[i][j].begin+0.01, buildingList[i][j].begin + buildingList[i][j].size-0.01);
          this.cx.arc(this.size/2, this.size/2, r+20, buildingList[i][j].begin + buildingList[i][j].size-0.01, buildingList[i][j].begin+0.01, true);
          this.cx.arc(this.size/2, this.size/2, r-20, buildingList[i][j].begin+0.01, buildingList[i][j].begin + buildingList[i][j].size-0.01);
          this.cx.stroke();
        }

        // selected
        if (this.buildingService.activeBuilding.i == i && this.buildingService.activeBuilding.j == j) {
          this.cx.beginPath();
          this.cx.strokeStyle = '#ffffff';
          this.cx.lineWidth = 3;
          this.cx.arc(this.size/2, this.size/2, r-20, buildingList[i][j].begin+0.01, buildingList[i][j].begin + buildingList[i][j].size-0.01);
          this.cx.arc(this.size/2, this.size/2, r+20, buildingList[i][j].begin + buildingList[i][j].size-0.01, buildingList[i][j].begin+0.01, true);
          this.cx.arc(this.size/2, this.size/2, r-20, buildingList[i][j].begin+0.01, buildingList[i][j].begin + buildingList[i][j].size-0.01);
          this.cx.stroke();
        }
      }
    }

    // forest
    for(let i=0; i<this.forest.length; i++) {
      this.cx.beginPath();
      this.cx.arc(this.size/2 + 390*Math.cos(i)+2, this.size/2 + 390*Math.sin(i)+10, this.forest[i], 0, 2 * Math.PI);
      this.cx.fillStyle = '#514734';
      this.cx.fill();
    }
    this.cx.beginPath();
    this.cx.strokeStyle = '#514734';
    this.cx.lineWidth = 300;
    this.cx.arc(this.size/2+2, this.size/2+10, 500, 0, Math.PI*2);
    this.cx.stroke();
    for(let i=0; i<this.forest.length; i++) {
      this.cx.beginPath();
      this.cx.arc(this.size/2 + 390*Math.cos(i), this.size/2 + 390*Math.sin(i), this.forest[i], 0, 2 * Math.PI);
      this.cx.fillStyle = '#67c668';
      this.cx.fill();
    }
    this.cx.beginPath();
    this.cx.strokeStyle = '#67c668';
    this.cx.lineWidth = 300;
    this.cx.arc(this.size/2, this.size/2, 500, 0, Math.PI*2);
    this.cx.stroke();
  }

  private toPolar(x, y) {
    let res = {distance: Math.sqrt( Math.pow(this.mouse.x, 2) + Math.pow(this.mouse.y, 2) ), angle: 0};
    res['angle'] = Math.acos(this.mouse.x / res.distance);
    if (this.mouse.y < 0)
      res.angle = -res.angle;
    if (res.angle < 0)
      res.angle += Math.PI *2;
    return res;
  }

  private captureEvents(canvasEl: HTMLCanvasElement) {
    fromEvent(canvasEl, 'mouseout')
    .subscribe((res: MouseEvent) => {
      this.mouse.x = 0;
      this.mouse.y = 0;
      this.buildingService.setOver(this.toPolar(res.offsetX, res.offsetY));
      this.redraw();
    });

    fromEvent(canvasEl, 'click')
    .subscribe((res: MouseEvent) => {
      this.buildingService.setActive();
      this.redraw();
    });

    fromEvent(canvasEl, 'mousemove')
    .subscribe((res: MouseEvent) => {
      this.buildingService.setOver(this.toPolar(res.offsetX, res.offsetY));
      this.mouse.x = res.offsetX-this.size/2;
      this.mouse.y = res.offsetY-this.size/2;
      this.redraw();
    });
  }

}
