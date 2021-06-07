export class Point {
  public x: number;
  public y: number;

  constructor(x: number = 0, y: number = 0) {
    this.x = x;
    this.y = y;
  }

  add(other: Point) {
    this.x += other.x;
    this.y += other.y;
  }

  public isPointInTheSamePosition(otherPoint: Point): boolean {
    return this.x === otherPoint.x && this.y === otherPoint.y;
  }
}
