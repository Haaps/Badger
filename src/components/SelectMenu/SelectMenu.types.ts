export type SelectMenuOption = {
  value: string;
  label: string;
};

export function createHoleOptions(count = 20): SelectMenuOption[] {
  return Array.from({ length: count }, (_, index) => {
    const id = String(index + 1).padStart(3, "0");

    return {
      value: `abc-00-${id}`,
      label: `ABC-00-${id}`,
    };
  });
}
