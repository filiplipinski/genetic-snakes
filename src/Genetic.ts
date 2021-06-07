import { Snake } from "./Snake";
import { randomGaussian } from "./utils";
import { rouletteSelection } from "./Genetic.utils";

export type GeneticConstructor = {
  populationSize: number;
  crossoverRate: number;
  mutationRate: number;
  createNewSnake: () => Snake;
};

export class Genetic {
  public generation: number;
  public populationSize: number;
  public population: Snake[] = []; // fitness value is the score of individual

  private readonly mutationRate: number;
  private readonly crossoverRate: number;
  private readonly createNewSnake: () => Snake;

  constructor({ createNewSnake, populationSize, crossoverRate, mutationRate }: GeneticConstructor) {
    this.createNewSnake = createNewSnake;
    this.populationSize = populationSize;
    this.mutationRate = mutationRate ?? 0.05;
    this.crossoverRate = crossoverRate ?? 0.8;
    this.generation = 1;
  }

  initialize() {
    this.population = [];

    for (let i = 0; i < this.populationSize; i++) {
      const snake = this.createNewSnake();

      this.population.push(snake);
    }
  }

  updateGeneration() {
    this.selection();
    this.crossoverController();
    this.mutateController();

    this.generation += 1;
  }

  selection() {
    const sumOfScores = this.population.reduce((acc, curr) => {
      return acc + curr.score;
    }, 0);

    if (sumOfScores === 0) {
      this.initialize();
      return;
    }

    const newPopulation = rouletteSelection(this.population, this.createNewSnake);

    this.population = newPopulation;
  }

  crossoverController() {
    for (let i = 0; i < this.population.length; i += 2) {
      if (Math.random() < this.crossoverRate) {
        const nextIndex = (i + 1) % this.population.length;

        const [offspring, offspring2] = this.crossover(
          this.population[i],
          this.population[nextIndex]
        );

        this.population[i] = offspring;
        this.population[nextIndex] = offspring2;
      }
    }
  }

  crossover(a: Snake, b: Snake): [Snake, Snake] {
    // best results are achieved by a crossover probability of between 0.65 and 0.85
    const offspring = this.createNewSnake();
    const offspring2 = this.createNewSnake();

    for (let i = 0; i < offspring.brain.length; i++) {
      // Weights
      for (let j = 0; j < offspring.brain[i].weights.length; j++) {
        const cutIndex = Math.floor(Math.random() * offspring.brain[i].weights[j].length);

        for (let k = 0; k < offspring.brain[i].weights[j].length; k++) {
          offspring.brain[i].weights[j][k] =
            cutIndex < k ? a.brain[i].weights[j][k] : b.brain[i].weights[j][k];

          offspring2.brain[i].weights[j][k] =
            cutIndex >= k ? a.brain[i].weights[j][k] : b.brain[i].weights[j][k];
        }
      }

      // Biases
      for (let i = 0; i < offspring.brain.length; i++) {
        const cutIndex = Math.floor(Math.random() * offspring.brain[i].biases.length);
        for (let j = 0; j < offspring.brain[i].biases[j]; j++) {
          offspring.brain[i].biases[j] = cutIndex < j ? a.brain[i].biases[j] : b.brain[i].biases[j];

          offspring2.brain[i].biases[j] =
            cutIndex >= j ? a.brain[i].biases[j] : b.brain[i].biases[j];
        }
      }
    }

    return [offspring, offspring2];
  }

  mutateController() {
    for (let i = 0; i < this.population.length; i++) {
      this.mutate(this.population[i]);
    }
  }

  mutate(individual: Snake) {
    for (let layer of individual.brain) {
      for (let row = 0; row < layer.weights.length; row++) {
        for (let col = 0; col < layer.weights[row].length; col++) {
          if (Math.random() < this.mutationRate) {
            layer.weights[row][col] += randomGaussian();
          }
        }
      }

      for (let j = 0; j < layer.biases.length; j++) {
        if (Math.random() < this.mutationRate) {
          layer.biases[j] += randomGaussian();
        }
      }
    }
  }
}
