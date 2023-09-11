type PriceData = {
  quantity: number;
  price?: number;
};

export const calcPrice = (data: PriceData[] = []): number =>
  data.reduce((prev, cur) => prev + (Number(cur.price) || 0) * cur.quantity, 0);
