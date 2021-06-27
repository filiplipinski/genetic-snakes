import { Game } from "./Game";
import { GameRenderer } from "./GameRenderer";
import { ChartRenderer } from "./ChartRenderer";
import { generateCsv } from "./utils/csvExporter";
import { LogData } from "./types";
import { getInputValue } from "./Main.utils";

export class Main {
  private boardSize: number; // ile kratek w szerokosci i wysokosci ma plansza dla snake'a
  private populationSize: number;
  private maxMoves: number;
  private crossoverRate: number;
  private mutationRate: number;
  private frameSpeed: number;
  private speedModeGenerations: number;

  private readonly gameCanvasElement: HTMLCanvasElement;
  private readonly startBtnElement: HTMLButtonElement;
  private readonly stopBtnElement: HTMLButtonElement;
  private readonly bestSnakeElement: HTMLButtonElement;

  private isGameRunning = false;
  private game: Game;
  private gameRenderer: GameRenderer;
  private chartRenderer: ChartRenderer;
  private logs: LogData[] = [];
  private speedModeIntervalId: NodeJS.Timeout;

  constructor() {
    this.gameCanvasElement = document.querySelector(".mid-section__game__canvas");
    this.startBtnElement = document.querySelector("#start");
    this.stopBtnElement = document.querySelector("#stop");
    this.bestSnakeElement = document.querySelector("#best-snake");

    this.chartRenderer = new ChartRenderer();
    this.bindListeners();
  }

  private bindListeners() {
    this.startBtnElement.addEventListener("click", () => this.start("normal"));
    this.stopBtnElement.addEventListener("click", () => this.stop());
    this.bestSnakeElement.addEventListener("click", () => this.showBestSnake());

    document.querySelector("#frame-speed").addEventListener("input", (e) => {
      this.frameSpeed = parseInt((e.target as HTMLInputElement).value);
    });
    document.querySelector("#speed-mode-btn")?.addEventListener("click", () => {
      this.runSpeedMode();
    });
    document.querySelector("#save-to-csv")?.addEventListener("click", () => {
      this.saveToCsv();
    });
    document.querySelector(".mid-section__chart__fullscreen-btn")?.addEventListener("click", () => {
      document.querySelector(".mid-section__chart")?.classList.toggle("mid-section__chart--big");
    });
    document.querySelector(".mid-section__chart__save-btn")?.addEventListener("click", () => {
      this.chartRenderer.downloadChart();
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

  private setCanvasSize(scale: number = 0.95) {
    // 90% of browser height is snake game, rest is margin
    const size = document.querySelector(".mid-section__game").clientHeight * scale;
    this.gameCanvasElement.width = size;
    this.gameCanvasElement.height = size;
  }

  private resetCanvas() {
    // reset canvas to initial state
    this.gameCanvasElement.width = 0;
    this.gameCanvasElement.height = 0;
  }

  private start(mode: "normal" | "speed") {
    if (this.isGameRunning) this.stop();
    this.logs = [];
    this.renderLogs();
    this.bestSnakeElement.disabled = true;
    this.startBtnElement.disabled = true;
    this.stopBtnElement.disabled = false;
    this.bestSnakeElement.disabled = false;
    this.getInputValues();
    this.chartRenderer.prepareChart();

    this.game = new Game({
      boardSize: this.boardSize,
      snakeMaxMoves: this.maxMoves,
      geneticProps: {
        populationSize: this.populationSize,
        crossoverRate: this.crossoverRate,
        mutationRate: this.mutationRate,
      },
      onNextGeneration: () => {
        const log = {
          generation: this.game.genetic.generation,
          bestScore: this.game.getBestScore(),
          avgScore: this.game.getAvgScore(),
        };
        this.logs.push(log);
        this.renderLogs();

        if (mode === "speed") {
          if (this.game.genetic.generation >= this.speedModeGenerations) {
            this.chartRenderer.updateChart(this.logs);
            this.stop();
          }
        } else {
          this.chartRenderer.updateChart(log);
        }
      },
    });
    this.isGameRunning = true;

    if (mode === "speed") {
      return;
    }

    this.setCanvasSize();
    this.gameRenderer = new GameRenderer(this.game, this.gameCanvasElement);
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
    this.gameRenderer = new GameRenderer(this.game, this.gameCanvasElement); // reinitialize grid size which depends on genetic populationSize
    this.runLoopForBestSnake();
  }

  private runLoop() {
    if (!this.isGameRunning) {
      return;
    }
    if (this.game.bestSnake) {
      this.bestSnakeElement.disabled = false;
    }
    this.gameRenderer.drawGrid();
    this.gameRenderer.drawSnakes();
    this.gameRenderer.drawFoods();

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
      // this.gameRenderer.drawSnakes();
      // TODO?: zrobic aby snake sie robil szary po smierci
      // nie robi sie bo brakuje tej klatki w ktorym jest dead
      return;
    }

    this.gameRenderer.drawGrid();
    this.gameRenderer.drawSnakes();
    this.gameRenderer.drawFoods();

    this.game.runStep({ shouldEvolve: false });

    setTimeout(
      () => requestAnimationFrame(() => this.runLoopForBestSnake()),
      1000 / this.frameSpeed
    );
  }

  private saveToCsv() {
    const title = `Population size: ${this.populationSize}. Crossover rate: ${this.crossoverRate}. Mutation rate: ${this.mutationRate}`;
    generateCsv(this.logs, title);
  }

  private renderLogs() {
    const logsContainerElement = document.querySelector(".right-section__logs__body");
    logsContainerElement.innerHTML = "";

    [...this.logs].reverse().forEach((l) => {
      const p = document.createElement("p");

      const logString = `• gen. ${l.generation}, best score: ${
        l.bestScore
      }, avg. score: ${l.avgScore.toFixed(2)}`;

      p.textContent = logString;
      logsContainerElement.appendChild(p);
    });
  }
}
