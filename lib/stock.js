export const thresholdFor = (product, org) =>
  product.lowStockThreshold ?? org.defaultLowStockThreshold;

export const isLow = (product, org) => product.quantity <= thresholdFor(product, org);

export const money = (n) =>
  n == null
    ? '–'
    : '₹' + Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
