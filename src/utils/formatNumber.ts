// src/utils/formatNumber.ts
export const formatNumber = (number: number | string) => {
  const parsedNumber = Number(number);

  if (isNaN(parsedNumber)) {
    return 0;
  }

  return parsedNumber.toLocaleString("es-ES", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
    useGrouping: true,
  });
};
