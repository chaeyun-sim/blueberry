export const formatCurrency = (value: number) =>
  new Intl.NumberFormat("ko-KR", { style: "currency", currency: "KRW" }).format(value);