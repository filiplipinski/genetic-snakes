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
  private speedModeGenerations: number;

  private readonly canvasElement: HTMLCanvasElement;
  private readonly startBtnElement: HTMLButtonElement;
  private readonly stopBtnElement: HTMLButtonElement;
  private readonly bestSnakeElement: HTMLButtonElement;
  private readonly speedModeElement: HTMLButtonElement;

  private isGameRunning = false;
  private game: Game;
  private canvasRenderer: CanvasRenderer;
  private logs: LogData[] = [];
  private speedModeIntervalId: NodeJS.Timeout;

  constructor() {
    this.canvasElement = document.querySelector("canvas");
    this.startBtnElement = document.querySelector("button#start");
    this.stopBtnElement = document.querySelector("button#stop");
    this.bestSnakeElement = document.querySelector("button#best-snake");
    this.speedModeElement = document.querySelector("button#speed-mode-btn");

    this.bindListeners();
  }

  private bindListeners() {
    this.startBtnElement.addEventListener("click", () => this.start("normal"));
    this.stopBtnElement.addEventListener("click", () => this.stop());
    this.bestSnakeElement.addEventListener("click", () => this.showBestSnake());
    this.speedModeElement.addEventListener("click", () => this.runSpeedMode());

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
    this.speedModeGenerations = getInputValue("#speed-mode");
  }

  private setCanvasSize(scale: number = 0.9) {
    // 90% of browser height is snake game, rest is margin
    const size = document.querySelector("body").clientHeight * scale;
    this.canvasElement.width = size;
    this.canvasElement.height = size;
  }

  private resetCanvas() {
    // reset canvas to initial state
    this.canvasElement.width = 0;
    this.canvasElement.height = 0;
  }

  private start(mode: "normal" | "speed") {
    this.logs = [];
    this.renderLogs();
    this.bestSnakeElement.disabled = true;
    this.startBtnElement.disabled = true;
    this.stopBtnElement.disabled = false;
    this.bestSnakeElement.disabled = false;
    this.getInputValues();

    this.game = new Game({
      boardSize: this.boardSize,
      snakeMaxMoves: this.maxMoves,
      geneticProps: {
        populationSize: this.populationSize,
        crossoverRate: this.crossoverRate,
        mutationRate: this.mutationRate,
      },
      onNextGeneration: () => {
        this.logs.push({
          generation: this.game.genetic.generation,
          bestScore: this.game.getBestScore(),
          mediumScore: this.game.getMediumScore(),
        });
        this.renderLogs();

        if (mode !== "speed") {
          return;
        }

        if (this.game.genetic.generation >= this.speedModeGenerations) {
          this.isGameRunning = false;
          clearInterval(this.speedModeIntervalId);
          return;
        }
      },
    });
    this.isGameRunning = true;

    if (mode === "speed") {
      return;
    }

    this.setCanvasSize();
    this.canvasRenderer = new CanvasRenderer(this.game, this.canvasElement);
    this.runLoop();
  }

  private stop() {
    this.isGameRunning = false;
    this.startBtnElement.disabled = false;
    this.stopBtnElement.disabled = true;

    clearInterval(this.speedModeIntervalId);
  }

  private showBestSnake() {
    const hasConfirmed =
      this.isGameRunning &&
      confirm("Are you sure you want to run simulation for best snake? It will stop current job.");
    if (this.isGameRunning && !hasConfirmed) {
      return;
    }

    this.stop();
    this.game.prepareGameForBestSnake();
    this.setCanvasSize(0.5);
    this.canvasRenderer = new CanvasRenderer(this.game, this.canvasElement); // reinitialize grid size which depends on genetic populationSize
    this.runLoopForBestSnake();
  }

  private runLoop() {
    if (!this.isGameRunning) {
      return;
    }
    if (this.game.bestSnake) {
      this.bestSnakeElement.disabled = false;
    }
    this.canvasRenderer.drawGrid();
    this.canvasRenderer.drawSnakes();
    this.canvasRenderer.drawFoods();

    this.game.runStep({ shouldEvolve: true });

    setTimeout(() => requestAnimationFrame(() => this.runLoop()), 1000 / this.frameSpeed);
  }

  private runSpeedMode() {
    const hasConfirmed =
      this.isGameRunning &&
      confirm(
        "Are you sure you want to run speed mode without simulation? It will stop current job."
      );
    if (this.isGameRunning && !hasConfirmed) {
      return;
    }

    this.start("speed");
    this.resetCanvas();

    this.speedModeIntervalId = setInterval(() => {
      for (let i = 0; i < 100; i++) {
        this.game.runStep({ shouldEvolve: true });
      }
    }, 1);
  }

  private runLoopForBestSnake() {
    // forBestSnake mode, there is always only one snake
    if (!this.game.genetic.population[0].isAlive) {
      // this.canvasRenderer.drawSnakes();
      // TODO?: zrobic aby snake sie robil szary po smierci
      // nie robi sie bo brakuje tej klatki w ktorym jest dead
      return;
    }

    this.canvasRenderer.drawGrid();
    this.canvasRenderer.drawSnakes();
    this.canvasRenderer.drawFoods();

    this.game.runStep({ shouldEvolve: false });

    setTimeout(
      () => requestAnimationFrame(() => this.runLoopForBestSnake()),
      1000 / this.frameSpeed
    );
  }

  private renderLogs() {
    const logsContainerElement = document.querySelector(".logs-container");
    logsContainerElement.innerHTML = "";

    [...this.logs].reverse().forEach((l) => {
      const p = document.createElement("p");

      const logString = `• gen. ${l.generation}, best score: ${
        l.bestScore
      }, avg. score: ${l.mediumScore.toFixed(2)}`;

      p.textContent = logString;
      logsContainerElement.appendChild(p);
    });
  }
}

new Main();
