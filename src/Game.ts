import { Point } from "./Point";
import { Snake } from "./Snake";
import { Food } from "./Food";
import { Genetic, GeneticConstructor } from "./Genetic";

type GameConstructor = {
  boardSize: number;
  snakeMaxMoves: number;
  geneticProps: Omit<GeneticConstructor, "createNewSnake">;
  onNextGeneration: () => void;
};

export class Game {
  public readonly boardSize: number;
  public readonly snakeMaxMoves: number;
  public readonly genetic: Genetic;
  public bestSnake: Snake | null = null;
  public foods: Food[] = [];
  private onNextGeneration: () => void;
  public currentGeneration: number = 0;

  // zrobic obiekt i przekazac jako obiekt propsy do population
  constructor({ boardSize, snakeMaxMoves, geneticProps, onNextGeneration }: GameConstructor) {
    this.boardSize = boardSize;
    this.snakeMaxMoves = snakeMaxMoves;
    this.onNextGeneration = onNextGeneration;
    this.genetic = new Genetic({
      ...geneticProps,
      createNewSnake: () => this.createNewSnake(),
    });

    this.genetic.initialize();
    this.generateNewFoodPosition();
  }

  public prepareGameForBestSnake() {
    const copiedSnake = this.createNewSnake();
    copiedSnake.brain = this.bestSnake.brain;

    this.genetic.populationSize = 1;
    this.genetic.population = [copiedSnake];
    this.generateNewFoodPosition();
  }

  // losuje randomowa pozycję. gdy boardSize np. = 15, to bedzie losowac liczby od 0 do 14
  public getRandomPosition(): Point {
    // TIP: floor obcina końcowkę
    // TIP: random losuje przedział [0,1]
    const x = Math.floor(Math.random() * this.boardSize);
    const y = Math.floor(Math.random() * this.boardSize);

    return new Point(x, y);
  }

  public getRandomFoodPosition(snake: Snake): Point {
    const foodPosition = this.getRandomPosition();

    for (let partOfSnake of snake.body) {
      // jezeli jedzenie chce sie wyrenderowac w miejscu weza, to wylosuj jeszce raz poprzez rekurencje
      if (foodPosition.isPointInTheSamePosition(partOfSnake)) {
        return this.getRandomFoodPosition(snake);
      }
    }

    return foodPosition;
  }

  public createNewSnake(): Snake {
    const snakeInitialPos = this.getRandomPosition();
    const snake = new Snake(snakeInitialPos, this.snakeMaxMoves);
    return snake;
  }

  // sprawdza co sie dzieje wokol weza, czy jest jedzenie, czy sa przeszkody
  private getObservation(snake: Snake, food: Food): number[] {
    const [head, ...tail] = snake.body;

    const isFoodUp = head.y > food.position.y;
    const isFoodRight = head.x < food.position.x;
    const isFoodDown = head.y < food.position.y;
    const isFoodLeft = head.x > food.position.x;

    let hasObstacleAbove = false;
    let hasObstacleRight = false;
    let hasObstacleBelow = false;
    let hasObstacleLeft = false;

    // Own tail
    for (let part of tail) {
      if (head.x === part.x) {
        if (head.y + 1 === part.y) {
          hasObstacleBelow = true;
        } else if (head.y - 1 === part.y) {
          hasObstacleAbove = true;
        }
      }

      if (head.y === part.y) {
        if (head.x + 1 === part.x) {
          hasObstacleRight = true;
        } else if (head.x - 1 === part.x) {
          hasObstacleLeft = true;
        }
      }
    }

    // Walls
    if (head.y - 1 === -1) {
      hasObstacleAbove = true;
    } else if (head.y + 1 === this.boardSize) {
      hasObstacleBelow = true;
    }

    if (head.x + 1 === this.boardSize) {
      hasObstacleRight = true;
    } else if (head.x - 1 === -1) {
      hasObstacleLeft = true;
    }

    return [
      isFoodUp ? 1 : 0,
      isFoodRight ? 1 : 0,
      isFoodDown ? 1 : 0,
      isFoodLeft ? 1 : 0,
      hasObstacleAbove ? 1 : 0,
      hasObstacleRight ? 1 : 0,
      hasObstacleBelow ? 1 : 0,
      hasObstacleLeft ? 1 : 0,
    ];
  }

  private findBestSnake() {
    const bestSnakeInGeneration = this.genetic.population.reduce((prev, curr) => {
      return prev.score > curr.score ? prev : curr;
    });

    if (!this.bestSnake || bestSnakeInGeneration.score > this.bestSnake.score) {
      this.bestSnake = bestSnakeInGeneration;
    }
  }

  private evolveToNextGeneration() {
    this.onNextGeneration();
    this.genetic.updateGeneration();
    this.generateNewFoodPosition();
  }

  public runStep({ shouldEvolve }: { shouldEvolve?: boolean }) {
    // shouldEvolve is FALSE if runStep runned for bestSnake
    if (shouldEvolve) {
      this.findBestSnake();
      const isAnySnakeAlive = this.genetic.population.some((snake) => snake.isAlive);

      if (!isAnySnakeAlive) {
        this.currentGeneration++;
        this.evolveToNextGeneration();
        return;
      }
    }

    const snakes = this.genetic.population;

    for (let i = 0; i < snakes.length; i++) {
      if (snakes[i].isAlive) {
        const state = this.getObservation(snakes[i], this.foods[i]);
        const direction = snakes[i].predictMove(state);

        // TODO: snaki jak gina to wychodza czasem poza swoja sciane
        // ponizej naprawia, ale i zamula od razu :<
        // fix tego rowniez powinien fixnac brak szarego snaeku w bestSnake op zgodnie

        // const copiedSnake = this.createNewSnake();
        // copiedSnake.body = snakes[i].body;
        // copiedSnake.move(direction);
        // copiedSnake.checkCollisions(this.boardSize);
        // if (!copiedSnake.isAlive) {
        //   // console.log("wylecial");
        //   snakes[i].isAlive = false;
        //   return;
        // }

        snakes[i].move(direction);
        snakes[i].checkCollisions(this.boardSize);
        this.feedSnake(snakes[i], i);
      }
    }
  }

  private feedSnake(snake: Snake, foodIndex: number): void {
    const head = snake.body[0];

    if (head.isPointInTheSamePosition(this.foods[foodIndex].position)) {
      snake.grow();
      snake.score += 1;

      const foodInitialPos = this.getRandomFoodPosition(snake);
      this.foods[foodIndex] = new Food(foodInitialPos);
    }
  }

  public getBestScore(): number {
    return Math.max(...this.genetic.population.map((snake) => snake.score));
  }

  public getMediumScore(): number {
    const sum = this.genetic.population.reduce((acc, curr) => {
      return acc + curr.score;
    }, 0);

    return sum / this.genetic.population.length;
  }

  public generateNewFoodPosition() {
    const newFoods = [];

    for (let i = 0; i < this.genetic.population.length; i++) {
      const foodInitialPos = this.getRandomFoodPosition(this.genetic.population[i]);
      const food = new Food(foodInitialPos);
      newFoods.push(food);
    }
    this.foods = newFoods;
  }
}
