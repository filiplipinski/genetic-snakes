import { Snake } from "./Snake";
import { randomInt } from "./utils";

const rouletteSelection = (population: Snake[], createNewSnake: () => Snake): Snake[] => {
  let newPopulation: Snake[] = [];

  const sumOfFitness = population.reduce((acc, curr) => {
    return acc + curr.fitness;
  }, 0);

  for (let i = 0; i < population.length; i++) {
    let pick = randomInt(0, sumOfFitness);
    let current = 0;
    for (let j = 0; j < population.length; j++) {
      current += population[j].fitness;

      if (current > pick) {
        const copiedSnake = createNewSnake();
        copiedSnake.brain = population[j].brain;

        newPopulation.push(copiedSnake);
        break;
      }
    }
  }

  return newPopulation;
};

const tournamentSelection = (population: Snake[], createNewSnake: () => Snake): Snake[] => {
  const tournamentSize = 50;
  const newPopulation: Snake[] = [];

  newPopulation.push(selectElite(population, createNewSnake));

  while (newPopulation.length !== population.length) {
    const pop = shuffle(population).slice(0, tournamentSize);
    const bestSnake = [...pop].sort((a, b) => b.score - a.score)[0];

    const copiedBestSnake = createNewSnake();
    copiedBestSnake.brain = bestSnake.brain;

    newPopulation.push(copiedBestSnake);
  }
  return newPopulation;
};

const selectElite = (population: Snake[], createNewSnake: () => Snake): Snake => {
  const eliteSnake = [...population].sort((a, b) => b.score - a.score)[0];
  const copiedEliteSnake = createNewSnake();
  copiedEliteSnake.brain = eliteSnake.brain;

  return copiedEliteSnake;
};

export function shuffle<T>(array: Array<T>): Array<T> {
  var currentIndex = array.length,
    temporaryValue,
    randomIndex;
  while (0 !== currentIndex) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }
  return array;
}

export { rouletteSelection, tournamentSelection };
