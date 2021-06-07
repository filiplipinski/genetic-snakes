import { Game } from "./Game";
import { CanvasRenderer } from "./CanvasRenderer";
import "./styles/index.css";

const getInputValue = (id: string): number => {
  return parseInt(document.querySelector<HTMLInputElement>(id).value);
};

type LogData = {
  generation: number;
  bestScore: number;
  mediumScore: number;
};

class Main {
  private boardSize: number; // ile kratek w szerokosci i wysokosci ma plansza dla snake'a
  private populationSize: number;
  private maxMoves: number;
  private crossoverRate: number;
  private mutationRate: number;
  private frameSpeed: number;

  private readonly canvasElement: HTMLCanvasElement;
  private readonly startBtnElement: HTMLButtonElement;
  private readonly stopBtnElement: HTMLButtonElement;

  private isGameRunning = false;
  private game: Game;
  private canvasRenderer: CanvasRenderer;
  private logs: LogData[] = [];

  constructor() {
    this.canvasElement = document.querySelector("canvas");
    this.startBtnElement = document.querySelector("button#start");
    this.stopBtnElement = document.querySelector("button#stop");

    this.bindListeners();
  }

  private bindListeners() {
    this.startBtnElement.addEventListener("click", () => this.start());
    this.stopBtnElement.addEventListener("click", () => this.stop());

    document.querySelector("#frame-speed").addEventListener("input", (e) => {
      this.frameSpeed = parseInt((e.target as HTMLInputElement).value);
    });
  }

  private getInputValues() {
    this.boardSize = getInputValue("#board-size");
    this.populationSize = getInputValue("#population-size");
    this.maxMoves = getInputValue("#max-moves");
    this.crossoverRate = getInputValue("#crossover-rate") / 100;
    this.mutationRate = getInputValue("#mutation-rate") / 100;
    this.frameSpeed = getInputValue("#frame-speed");
  }

  private setCanvasSize() {
    // 90% of browser height is snake game, rest is margin
    const size = document.querySelector("body").clientHeight * 0.9;
    this.canvasElement.width = size;
    this.canvasElement.height = size;
  }

  private start() {
    this.logs = [];
    this.startBtnElement.disabled = true;
    this.stopBtnElement.disabled = false;
    this.getInputValues();
    this.setCanvasSize();

    this.game = new Game({
      boardSize: this.boardSize,
      snakeMaxMoves: this.maxMoves,
      geneticProps: {
        populationSize: this.populationSize,
        crossoverRate: this.crossoverRate,
        mutationRate: this.mutationRate,
      },
    });

    this.isGameRunning = true;
    this.canvasRenderer = new CanvasRenderer(this.game, this.canvasElement);

    this.runLoop();
  }

  private stop() {
    this.isGameRunning = false;
    this.startBtnElement.disabled = false;
    this.stopBtnElement.disabled = true;
  }

  private runLoop() {
    if (!this.isGameRunning) {
      return;
    }
    this.canvasRenderer.drawGrid();
    this.canvasRenderer.drawSnakes();
    this.canvasRenderer.drawFoods();

    this.game.runStep();

    if (this.game.isOver) {
      this.logs.push({
        generation: this.game.genetic.generation,
        bestScore: this.game.getBestScore(),
        mediumScore: this.game.getMediumScore(),
      });
      this.renderLogs();

      // kolejna generacja
      this.game.isOver = false;
      this.game.genetic.updateGeneration();
      this.game.generateNewFoodPosition();
    }

    if (this.isGameRunning) {
      setTimeout(() => requestAnimationFrame(() => this.runLoop()), 1000 / this.frameSpeed);
    }
  }

  private renderLogs() {
    const logsContainerElement = document.querySelector(".logs-container");
    logsContainerElement.innerHTML = "";

    this.logs.forEach((l) => {
      const p = document.createElement("p");

      const logString = `• gen. ${l.generation}, best score: ${l.generation}, avg. score: ${l.mediumScore}`;

      p.textContent = logString;
      logsContainerElement.appendChild(p);
    });
  }
}

new Main();
