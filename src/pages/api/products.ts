import { NextApiRequest, NextApiResponse } from 'next';
import { CoinbasePro } from 'coinbase-pro-node';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const coinbaseClient = new CoinbasePro();
  const products = await coinbaseClient.rest.product.getProducts();
  res.json(products.sort((a, b) => a.id.localeCompare(b.id)));
};
