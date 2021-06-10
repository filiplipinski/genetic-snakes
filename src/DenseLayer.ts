import { randomGaussian } from "./utils";

export class DenseLayer {
  numOfInputs: number;
  numOfOutputs: number;
  weights: number[][];
  biases: number[];

  constructor(numOfInputs: number, numOfOutputs: number) {
    this.numOfInputs = numOfInputs;
    this.numOfOutputs = numOfOutputs;
    this.weights = this.initWeights();
    this.biases = this.initBiases();
  }

  // Relu or sigmoid
  // sigmoid(number: number) {
  //   return 1 / (1 + Math.exp(-number));
  // }

  relu(number: number) {
    return Math.max(0, number);
  }

  activate(inputs: number[]): number[] {
    let result = [];

    for (let i = 0; i < this.numOfOutputs; i++) {
      result[i] = 0;

      for (let j = 0; j < inputs.length; j++) {
        result[i] += inputs[j] * this.weights[j][i];
      }

      result[i] += this.biases[i];
      result[i] = this.relu(result[i]);
    }

    return result;
  }

  initWeights(): number[][] {
    let weights = [];

    for (let i = 0; i < this.numOfInputs; i++) {
      weights[i] = [];

      for (let j = 0; j < this.numOfOutputs; j++) {
        weights[i].push(randomGaussian());
      }
    }

    return weights;
  }

  initBiases(): number[] {
    let biases = [];

    for (let i = 0; i < this.numOfOutputs; i++) {
      biases.push(randomGaussian());
    }

    return biases;
  }
}
