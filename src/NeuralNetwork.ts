import { DenseLayer } from "./DenseLayer";

export class NeuralNetwork {
  public layers: DenseLayer[];

  constructor() {
    // input layer = 8 input
    // one hidden layer = 8 neurons
    // output layer = 4 outputs
    this.layers = [new DenseLayer(8, 4)];
  }

  // Acitivation function: Sigmoid
  private sigmoid(number: number) {
    return 1 / (1 + Math.exp(-number));
  }

  // Activation function: Relu
  private relu(number: number) {
    return Math.max(0, number);
  }

  public activate(snakeObservation: number[]) {
    let inputs = snakeObservation;
    let outputs: number[];

    for (let i = 0; i < this.layers.length; i++) {
      outputs = this.layers[i].calculate(inputs);

      const isLastLayer = i === this.layers.length - 1;

      if (isLastLayer) {
        // ostatnia warstwa, na output przelicz sigmoidem
        outputs = outputs.map((output) => {
          return this.sigmoid(output);
        });
      } else {
        // aktywacja wyniku z layer'a
        outputs = outputs.map((output) => {
          return this.relu(output);
        });
      }

      inputs = outputs;
    }

    return outputs;
  }
}
