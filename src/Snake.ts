import { Point } from "./Point";
import { DenseLayer } from "./DenseLayer";

const indexToDirectionsMap: Record<number, Point> = {
  0: new Point(0, -1), // góra
  1: new Point(1, 0), // prawo
  2: new Point(0, 1), // dół
  3: new Point(-1, 0), // lewo
};

export class Snake {
  body: Point[];
  brain: DenseLayer[];
  maxMoves: number;
  remainingMoves: number;

  score: number = 0;
  isAlive: boolean = true;

  constructor(initialPos: Point, maxMoves: number) {
    this.body = [initialPos]; // ustaw pierwszą dlugosc węza, jego glowa
    this.brain = [new DenseLayer(8, 8), new DenseLayer(8, 4)];
    this.maxMoves = maxMoves;
    this.remainingMoves = maxMoves;
  }

  public predictMove(state: number[]): Point {
    let inputs = state;
    let outputs: number[];

    for (const layer of this.brain) {
      outputs = layer.activate(inputs);
      inputs = outputs;
    }

    // index najwiekszej wagi
    const dirIndex = outputs.indexOf(Math.max(...outputs));

    return indexToDirectionsMap[dirIndex];
  }

  // TODO: wylaczyc mozliwosc ruszeani sie w miejsce gdzie skad snake nadchodzi
  public move(direction: Point) {
    const head = this.body[0];
    const nextHead = new Point(head.x, head.y);
    nextHead.add(direction);

    const tailWithoutLast = this.body.slice(0, -1);

    this.body = [nextHead].concat(tailWithoutLast);
    this.remainingMoves -= 1;

    if (this.remainingMoves < 0) {
      this.isAlive = false;
    }
  }

  public checkCollisions(boardSize: number) {
    const head = this.body[0];
    const tail = this.body.slice(1);

    for (const part of tail) {
      if (head.isPointInTheSamePosition(part)) {
        this.isAlive = false;
      }
    }

    if (head.x >= boardSize || head.x < 0) {
      this.isAlive = false;
    }

    if (head.y >= boardSize || head.y < 0) {
      this.isAlive = false;
    }
  }

  public grow() {
    const lastPart = this.body[this.body.length - 1];
    const newBodyPart = new Point(lastPart.x, lastPart.y);
    this.body.push(newBodyPart);
    this.remainingMoves = this.maxMoves;
  }
}
