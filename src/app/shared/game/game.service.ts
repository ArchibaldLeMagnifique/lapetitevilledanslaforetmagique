import { Injectable } from '@angular/core';
import { Observable, interval, Subject  } from 'rxjs';

@Injectable({
  providedIn: 'root'
})


export class GameService {

  constructor() {
    this.saveLoop.subscribe((value) => { this.save(); });
  }

  // game loops 50 time per sec
  public gameLoop = interval(1000/50);

  // save every 15 sec
  public saveLoop = interval(15000);

  // redraw listener
  private redrawListener = new Subject<any>();
  public listenForRedraw(): Observable<any> {
     return this.redrawListener.asObservable();
  }
  public redraw() {
    this.redrawListener.next();
  }

  // save listener
  private saveListener = new Subject<any>();
  public listenForSave(): Observable<any> {
     return this.saveListener.asObservable();
  }
  public save() {
    this.saveListener.next();
  }

  public timeToDate(time) {
    if (time < 1000) {
      return Math.floor(time/10)/100+"s";
    } else {
      time = Math.floor(time/1000);
    }
    let res = "";
    if (time>=86400) {
      let days = Math.floor(time/86400);
      res += days + "d ";
      time -= 86400*days;
    }
    if (time>=3600) {
      let hours = Math.floor(time/3600);
      res += hours + "h ";
      time -= 3600*hours;
    }
    if (time>=60) {
      let minutes = Math.floor(time/60);
      res += minutes + "min ";
      time -= 60*minutes;
    }
    res += time +"s"
    return res;
  }

}
