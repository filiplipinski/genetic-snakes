import { Point } from "./Point";

export class Food {
  public readonly position: Point;

  constructor(position: Point) {
    this.position = position;
  }
}
