import {Injectable} from "@angular/core";
import {SteerCommand} from "../../models/steer-command";
import {HttpClient} from "@angular/common/http";

@Injectable({
  providedIn: "root"
})
export class VehicleService {

  x: number;
  y: number;
  rot: number;

  readonly mapW = 500;
  readonly mapH = 500;

  readonly rotSpeed = 5;
  readonly moveSpeed = 2;

  steerCommand: SteerCommand = {};
  commandSendDate?: Date;


  constructor(
    private http: HttpClient,
  ) {
    this.x = this.mapW / 2;
    this.y = this.mapH / 2;
    this.rot = 0;

    (window as any).vehicle = this;

    // setInterval(() => {
    //   if (this.doComputation) {
    //     this.tick();
    //   }
    // }, 300)
  }

  tick() {

    this.rotate();

    this.move();

    this.returnToMapArea();

    //console.log({x: this.x, y: this.y})
  }

  rotate() {
    if (this.steerCommand?.l) {
      this.rot -= this.rotSpeed;
    }

    if (this.steerCommand?.r) {
      this.rot += this.rotSpeed;
    }

    if (this.rot < 0) {
      this.rot = 360 + this.rot;
    }

    this.rot %= 360;
  }

  move() {
    const distanceTraveled = this.moveSpeed;

    const xAdd = distanceTraveled * Math.sin(this.toRadian(this.rot));
    const yAdd = distanceTraveled * Math.cos(this.toRadian(this.rot));

    if (this.steerCommand?.f) {

      this.x += xAdd;
      this.y += yAdd;
    }
    if (this.steerCommand?.b) {
      this.x -= xAdd;
      this.y -= yAdd;
    }
  }

  returnToMapArea() {
    this.x = Math.max(0, this.x);
    this.x = Math.min(this.x, this.mapW);

    this.y = Math.max(0, this.y);
    this.y = Math.min(this.y, this.mapH);
  }

  toRadian(deg: number) {
    return Math.PI / 180 * deg;
  }

  async setInput(command: SteerCommand) {
    this.commandSendDate = new Date();
    console.log("Setting command: ", command);
    this.steerCommand = command;
    await this.sendCommandToLocalServer();
  }

  async sendCommandToLocalServer(){
    const left = !!this.steerCommand.l;
    const right = !!this.steerCommand.r;
    const forward = !!this.steerCommand.f;
    const backward = !!this.steerCommand.b;
    await this.http.get(`http://localhost:12345?left=${left}&right=${right}&forward=${forward}&backward=${backward}`).toPromise();
  }
}
