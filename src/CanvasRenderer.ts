import { Game } from "./Game";

type Screen = {
  width: number;
  height: number;
};

export class CanvasRenderer {
  private readonly game: Game;
  private readonly ctx: CanvasRenderingContext2D;
  private readonly screen: Screen;

  private readonly numOfGrids: number;
  private readonly gridSizePx: number;

  constructor(game: Game, canvas: HTMLCanvasElement) {
    this.game = game;
    this.ctx = canvas.getContext("2d");
    this.screen = {
      width: canvas.width,
      height: canvas.height,
    };

    // numRows to tyle ile ma byc wierszy, gdy np. populacji jest 99, to stworzy 10 wierszy i 10 kolumn
    this.numOfGrids = Math.ceil(Math.sqrt(this.game.genetic.populationSize));
    // grizSize = screenHeight to tyle ile pikseli / ilosc rows. Wtedy wyjdzie ile ma jeden grid pikseli
    // height bo to i tak kwadrat
    this.gridSizePx = this.screen.height / this.numOfGrids;
  }

  private drawRect(x: number, y: number, size: number, color: string) {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(x, y, size, size);
  }

  public drawGrid() {
    for (let i = 0; i < this.numOfGrids; i++) {
      for (let j = 0; j < this.numOfGrids; j++) {
        let color;

        if ((i + j) % 2) {
          color = "#263445";
        } else {
          color = "#212A37";
        }

        this.drawRect(i * this.gridSizePx, j * this.gridSizePx, this.gridSizePx, color);
      }
    }
  }

  public drawSnakes() {
    const snakes = this.game.genetic.population;
    const stepSize = this.gridSizePx / this.game.boardSize;

    for (let i = 0; i < snakes.length; i++) {
      const xOffset = i % this.numOfGrids;
      const yOffset = Math.floor(i / this.numOfGrids);

      // tu sie robi coraz ciemniejszy, przemyslec algortym
      const greencolorStep = 150 / snakes[i].body.length;
      const greyColorStep = 50 / snakes[i].body.length;
      let green = 255;
      let grey = 150;

      for (let part of snakes[i].body) {
        this.drawRect(
          xOffset * this.gridSizePx + part.x * stepSize,
          yOffset * this.gridSizePx + part.y * stepSize,
          stepSize,
          snakes[i].isAlive ? `rgb(0, ${green}, 0)` : `rgb(${grey}, ${grey}, ${grey})`
        );
        green -= greencolorStep;
        grey -= greyColorStep;
      }
    }
  }

  public drawFoods() {
    const stepSize = this.gridSizePx / this.game.boardSize;

    for (let i = 0; i < this.game.foods.length; i++) {
      if (this.game.genetic.population[i].isAlive) {
        const xOffset = i % this.numOfGrids;
        const yOffset = Math.floor(i / this.numOfGrids);

        this.drawRect(
          xOffset * this.gridSizePx + this.game.foods[i].position.x * stepSize,
          yOffset * this.gridSizePx + this.game.foods[i].position.y * stepSize,
          stepSize,
          "#f00"
        );
      }
    }
  }
}
