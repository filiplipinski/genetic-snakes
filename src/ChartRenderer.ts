import { Chart, registerables } from "chart.js";
import { lineChartOptions, initialChartData } from "./ChartRenderer.utils";
import { LogData } from "./types";

const CHART_CANVAS_SELECTOR = ".mid-section__chart__canvas";

export class ChartRenderer {
  private readonly ctx: CanvasRenderingContext2D;
  private chart: Chart;

  constructor() {
    const canvasElement = document.querySelector<HTMLCanvasElement | null>(CHART_CANVAS_SELECTOR);
    if (!canvasElement) {
      throw new Error("Chart canvas not found");
    }

    this.ctx = canvasElement.getContext("2d");
    Chart.register(...registerables);

    this.chart = new Chart(this.ctx, {
      type: "line",
      options: lineChartOptions,
      data: initialChartData,
    });
  }

  prepareChart() {
    this.chart.data.labels = [];
    this.chart.data.datasets[0].data = [];
    this.chart.data.datasets[1].data = [];

    this.chart.update();
  }

  updateChart(log: LogData) {
    this.chart.data.labels.push(log.generation);
    this.chart.data.datasets[0].data.push(log.bestScore);
    this.chart.data.datasets[1].data.push(log.mediumScore);

    this.chart.update();
  }
}
