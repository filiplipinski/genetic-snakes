import { ChartConfiguration } from "chart.js";

export const initialChartData: ChartConfiguration<"line", number[], string>["data"] = {
  labels: [],
  datasets: [
    {
      label: "Best score",
      data: [],
      borderColor: "rgba(255, 99, 132, 1)",
      fill: false,
      cubicInterpolationMode: "monotone",
      tension: 0.4,
    },
    {
      label: "Average score",
      data: [],
      borderColor: "rgba(54, 162, 235, 1)",
      fill: false,
      cubicInterpolationMode: "monotone",
      tension: 1,
    },
  ],
};

export const lineChartOptions: ChartConfiguration<"line", number[], string>["options"] = {
  responsive: true,
  plugins: {
    title: {
      display: true,
      text: "Graph of the dependence of the number of generations on the best and average score",
    },
  },
  interaction: {
    intersect: false,
  },
  scales: {
    x: {
      display: true,
      title: {
        display: true,
        text: "Number of generations",
      },
    },
    y: {
      display: true,
      suggestedMin: 0,
      suggestedMax: 10,
    },
  },
  maintainAspectRatio: false,
};
