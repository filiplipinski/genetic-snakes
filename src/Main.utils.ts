export const getInputValue = (id: string): number => {
  const inputValue = document.querySelector<HTMLInputElement>(id).value.replaceAll(',', '.');

  return Number(inputValue);
};
