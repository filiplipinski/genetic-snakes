export const randomGaussian = (): number => {
  let sum = 0;

  for (let i = 0; i < 20; i++) {
    sum += Math.random() * 6 - 3;
  }

  let value = sum / 10;

  return value;
};

// wlaczenie z min, ale bez max
export const randomInt = (min: number = 0, max: number = 1): number => {
  return Math.floor(Math.random() * (max - min) + min);
};

export const randomFloat = (min: number = 0, max: number = 1): number => {
  return Math.random() * (max - min) + min;
};
