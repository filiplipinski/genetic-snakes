import { Snake } from "./Snake";
import { randomGaussian } from "./utils";

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
  private selectionPool: Snake[] = [];

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
    this.calculateFitness();
    this.updateSelectionPool();

    const newPopulation: Snake[] = [];

    for (let i = 0; i < this.population.length; i++) {
      const [parent1, parent2] = this.selectParents();

      const child = this.crossover(parent1, parent2);
      const mutatedChild = this.mutate(child);

      newPopulation.push(mutatedChild);
    }

    this.population = newPopulation;
    this.generation += 1;
  }

  calculateFitness() {
    this.population.forEach((snake) => snake.calculateFitness());
  }

  updateSelectionPool() {
    // it build roulette wheel
    const sumOfFitness = this.population.reduce((acc, curr) => {
      return acc + curr.fitness;
    }, 0);

    this.selectionPool = [];

    for (let snake of this.population) {
      const participation = Math.floor((snake.fitness / sumOfFitness) * 1000);

      for (let i = 0; i < participation; i++) {
        const copySnake = this.createNewSnake();
        copySnake.brain = snake.brain;
        copySnake.fitness = snake.fitness;
        copySnake.score = snake.score;

        this.selectionPool.push(copySnake);
      }
    }

    if (this.selectionPool.length === 0) {
      // if no snake added to selectionPool (cause all of them has bad scores,
      // and they rate for 0 participation) then reinitialize weights and copy
      // population to pool
      this.initialize();
      this.selectionPool = [...this.population];
    }
  }

  selectParents() {
    // selekcja kolem ruletki
    const aIndex = Math.floor(Math.random() * this.selectionPool.length);
    const bIndex = Math.floor(Math.random() * this.selectionPool.length);
    const parent1 = this.selectionPool[aIndex];
    const parent2 = this.selectionPool[bIndex];

    return [parent1, parent2];
  }

  crossover(a: Snake, b: Snake): Snake {
    if (Math.random() >= this.crossoverRate) {
      return a;
    }
    // best results are achieved by a crossover probability of between 0.65 and 0.85
    const offspring = this.createNewSnake();

    // Weights
    for (let i = 0; i < offspring.brain.layers.length; i++) {
      for (let j = 0; j < offspring.brain.layers[i].weights.length; j++) {
        const cutIndex = Math.floor(Math.random() * offspring.brain.layers[i].weights[j].length);

        for (let k = 0; k < offspring.brain.layers[i].weights[j].length; k++) {
          offspring.brain.layers[i].weights[j][k] =
            cutIndex < k ? a.brain.layers[i].weights[j][k] : b.brain.layers[i].weights[j][k];
        }
      }
    }

    // Biases
    for (let i = 0; i < offspring.brain.layers.length; i++) {
      const cutIndex = Math.floor(Math.random() * offspring.brain.layers[i].biases.length);

      for (let j = 0; j < offspring.brain.layers[i].biases.length; j++) {
        offspring.brain.layers[i].biases[j] =
          cutIndex < j ? a.brain.layers[i].biases[j] : b.brain.layers[i].biases[j];
      }
    }

    return offspring;
  }

  mutate(snake: Snake): Snake {
    const offspring = this.createNewSnake();
    offspring.brain = snake.brain;

    for (let i = 0; i < offspring.brain.layers.length; i++) {
      for (let row = 0; row < offspring.brain.layers[i].weights.length; row++) {
        for (let col = 0; col < offspring.brain.layers[i].weights[row].length; col++) {
          if (Math.random() < this.mutationRate) {
            offspring.brain.layers[i].weights[row][col] += randomGaussian() / 8;

            if (offspring.brain.layers[i].weights[row][col] > 1) {
              offspring.brain.layers[i].weights[row][col] = 1;
            }
            if (offspring.brain.layers[i].weights[row][col] < -1) {
              offspring.brain.layers[i].weights[row][col] = -1;
            }
          }
        }
      }

      for (let k = 0; k < offspring.brain.layers[i].biases.length; k++) {
        if (Math.random() < this.mutationRate) {
          offspring.brain.layers[i].biases[k] += randomGaussian() / 8;

          if (offspring.brain.layers[i].biases[k] > 1) {
            offspring.brain.layers[i].biases[k] = 1;
          }
          if (offspring.brain.layers[i].biases[k] < -1) {
            offspring.brain.layers[i].biases[k] = -1;
          }
        }
      }
    }

    return offspring;
  }
}
