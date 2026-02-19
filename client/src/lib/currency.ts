export type CurrencyCode = "XAF" | "USD";

const USD_TO_XAF_RATE = 600;
const XAF_PREFIX = "XAF ";
const USD_PREFIX = "$";

const normalizeAmount = (amount: number, currency: CurrencyCode) => {
  if (currency === "XAF") {
    return Math.round(amount);
  }

  return Number(amount.toFixed(2));
};

export const convertCurrencyAmount = (
  amount: number,
  from: CurrencyCode,
  to: CurrencyCode,
) => {
  if (from === to) {
    return normalizeAmount(amount, to);
  }

  const amountInXaf =
    from === "XAF" ? amount : amount * USD_TO_XAF_RATE;
  const converted =
    to === "XAF" ? amountInXaf : amountInXaf / USD_TO_XAF_RATE;

  return normalizeAmount(converted, to);
};

export const toXafAmount = (amount: number, from: CurrencyCode) =>
  convertCurrencyAmount(amount, from, "XAF");

export const formatCurrencyAmount = (
  amountXaf: number,
  currency: CurrencyCode,
) => {
  const converted = convertCurrencyAmount(amountXaf, "XAF", currency);

  if (currency === "USD") {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(converted);
  }

  return `${XAF_PREFIX}${Math.round(converted).toLocaleString()}`;
};

export const formatCurrencyCompact = (
  amountXaf: number,
  currency: CurrencyCode,
) => {
  const converted = convertCurrencyAmount(amountXaf, "XAF", currency);
  const prefix = currency === "USD" ? USD_PREFIX : XAF_PREFIX;
  const absolute = Math.abs(converted);

  if (absolute >= 1000) {
    const kValue = converted / 1000;
    const label = Number.isInteger(kValue)
      ? kValue.toString()
      : kValue.toFixed(1);
    return `${prefix}${label}k`;
  }

  if (currency === "USD") {
    const label = Number.isInteger(converted)
      ? converted.toString()
      : converted.toFixed(2);
    return `${prefix}${label}`;
  }

  return `${prefix}${Math.round(converted)}`;
};
