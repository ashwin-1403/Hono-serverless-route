export function generateNumericId(digits: number): number {
    const max = Math.pow(10, digits) - 1;
    const randomNumber = Math.floor(Math.random() * max);
    const id = randomNumber.toString().padStart(digits, '0');
    return Number(id);
  }
  