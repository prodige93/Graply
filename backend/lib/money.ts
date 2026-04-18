/** Aligné sur src/enterprise/lib/campaignBudgetRules.ts */
export function parseMoneyEuros(s: string): number {
  return parseFloat(String(s).replace(/[^0-9.]/g, "")) || 0;
}

export function budgetToCents(budget: string): number {
  return Math.round(parseMoneyEuros(budget) * 100);
}
