import { Point } from "./Point";
import { NeuralNetwork } from "./NeuralNetwork";

const indexToDirectionsMap: Record<number, Point> = {
  0: new Point(0, -1), // góra
  1: new Point(1, 0), // prawo
  2: new Point(0, 1), // dół
  3: new Point(-1, 0), // lewo
};

export class Snake {
  body: Point[];
  brain: NeuralNetwork;
  maxMoves: number;
  remainingMoves: number;

  fitness: number = 0;
  lifetime: number = 0;
  score: number = 0;
  isAlive: boolean = true;

  constructor(initialPos: Point, maxMoves: number) {
    this.body = [initialPos]; // ustaw pierwszą dlugosc węza, jego glowa
    this.brain = new NeuralNetwork();
    this.maxMoves = maxMoves;
    this.remainingMoves = maxMoves;
  }

  public predictMove(state: number[]): Point {
    const NNoutput = this.brain.activate(state);

    const dirIndex = NNoutput.indexOf(Math.max(...NNoutput));

    return indexToDirectionsMap[dirIndex];
  }

  public calculateFitness() {
    if (this.score < 10) {
      this.fitness = Math.floor(this.lifetime * Math.pow(2, this.score));
    } else {
      // wolniej rosnie na score >=10, zeby fitness nie byl jakis ogromny
      this.fitness = this.lifetime;
      this.fitness *= Math.pow(2, 10);
      this.fitness *= this.score - 9;
    }
  }

  // TODO: wylaczyc mozliwosc ruszeani sie w miejsce gdzie skad snake nadchodzi
  // ED. to jest chyba w predict, own tail
  public move(direction: Point) {
    const head = this.body[0];
    const nextHead = new Point(head.x, head.y);
    nextHead.add(direction);

    const tailWithoutLast = this.body.slice(0, -1);

    this.body = [nextHead].concat(tailWithoutLast);
    this.remainingMoves -= 1;
    this.lifetime++;

    if (this.remainingMoves <= 0) {
      this.isAlive = false;
      // to są snaki ktore np. tylko ida 1 w gore, a potem 1 w dol i tak w kolko
      this.lifetime = 0;
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
