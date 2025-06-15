
export const generateLocationConfirmationCode = (existingCodes: string[]): string => {
  const numbers = '0123456789';
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let code: string;

  do {
    const num1 = numbers.charAt(Math.floor(Math.random() * numbers.length));
    const letter = letters.charAt(Math.floor(Math.random() * letters.length));
    const num2 = numbers.charAt(Math.floor(Math.random() * numbers.length));
    code = `${num1}${letter}${num2}`;
  } while (existingCodes.includes(code));

  return code;
};
