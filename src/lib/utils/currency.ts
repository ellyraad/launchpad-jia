/**
 * Currency codes supported by the application
 */
export const CURRENCIES = ["PHP", "USD", "EUR", "GBP", "JPY", "AUD", "CAD", "SGD", "CHF", "CNY", "INR"] as const;

export type Currency = (typeof CURRENCIES)[number];

/**
 * Currency symbols mapped to their codes
 */
export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  PHP: "₱",
  USD: "$",
  EUR: "€",
  GBP: "£",
  JPY: "¥",
  AUD: "A$",
  CAD: "C$",
  SGD: "S$",
  CHF: "Fr",
  CNY: "¥",
  INR: "₹",
};

/**
 * Default currency for the application
 */
export const DEFAULT_CURRENCY: Currency = "PHP";

/**
 * Get currency symbol by code
 * @param code - Currency code
 * @returns Currency symbol or the code itself if not found
 */
export const getCurrencySymbol = (code: string): string => {
  return CURRENCY_SYMBOLS[code as Currency] || code;
};

/**
 * Check if a currency code is valid
 * @param code - Currency code to validate
 */
export const isValidCurrency = (code: string): code is Currency => {
  return CURRENCIES.includes(code as Currency);
};
