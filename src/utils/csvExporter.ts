import { ExportToCsv } from "export-to-csv";

const baseOptions = {
  fieldSeparator: ",",
  quoteStrings: '"',
  decimalSeparator: ".",
  showLabels: true,
  showTitle: true,
  filename: "genetic_snakes_logs",
  title: "Genetic Snakes logs",
  useBom: true,
  useKeysAsHeaders: true,
  //   headers: ["Column 1", "Column 2"], // <-- Won't work with useKeysAsHeaders present!
};

export const generateCsv = (data: unknown[], title: string) => {
  const csvExporter = new ExportToCsv({ ...baseOptions, title });

  csvExporter.generateCsv(data);
};
