export const getInputValue = (id: string): number => {
  return parseInt(document.querySelector<HTMLInputElement>(id).value);
};
