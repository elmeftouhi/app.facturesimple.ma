export function formatCurrency(value, locale = "fr-MA", currency = "MAD") {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 2
  }).format(value);
}
