import { randomGaussian } from "./utils";

export class DenseLayer {
  numOfInputs: number;
  numOfOutputs: number;
  weights: number[][]; // pierwsza array to ilosc neuronow, drugi array to wagi
  biases: number[];

  constructor(numOfInputs: number, numOfOutputs: number) {
    this.numOfInputs = numOfInputs;
    this.numOfOutputs = numOfOutputs;
    this.weights = this.initWeights();
    this.biases = this.initBiases();
  }

  calculate(inputs: number[]): number[] {
    let result: number[] = [];

    for (let i = 0; i < this.numOfOutputs; i++) {
      result[i] = 0;

      for (let j = 0; j < inputs.length; j++) {
        result[i] += inputs[j] * this.weights[j][i];
      }

      result[i] += this.biases[i];
    }

    return result;
  }

  initWeights(): number[][] {
    let weights: number[][] = [];

    for (let i = 0; i < this.numOfInputs; i++) {
      weights[i] = [];

      for (let j = 0; j < this.numOfOutputs; j++) {
        weights[i].push(randomGaussian() / 4.5);
      }
    }

    return weights;
  }

  initBiases(): number[] {
    let biases: number[] = [];

    for (let i = 0; i < this.numOfOutputs; i++) {
      biases.push(randomGaussian() / 4.5);
    }

    return biases;
  }
}
