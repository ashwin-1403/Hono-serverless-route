
export type ValidationRule = {
    condition: boolean;
    statusCode: number;
    message: string;
  };

export const validateInputs = (c: any, validationRules: ValidationRule[]) => {
    for (const rule of validationRules) {
      if (!rule.condition) {
        c.status(rule.statusCode);
        return c.json({ message: rule.message });
      }
    }
  }