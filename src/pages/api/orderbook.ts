// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest } from 'next';
import { NextApiResponseServerIO } from '../../types/next';
import {
  CoinbasePro,
  WebSocketChannelName,
  WebSocketEvent,
  WebSocketResponse,
} from 'coinbase-pro-node';
import { Server as NetServer } from 'http';
import { Server as ServerIO } from 'socket.io';

export default function handler(req: NextApiRequest, res: NextApiResponseServerIO) {
  let selectedProduct = '';
  const coinbaseClient = new CoinbasePro();
  const queue: WebSocketResponse[] = [];
  let timeStamp = Date.now();

  const subscribeToProduct = () => {
    coinbaseClient.ws.subscribe({
      product_ids: [`${selectedProduct}`],
      name: WebSocketChannelName.LEVEL2,
    });
  };

  if (!res.socket.server.io) {
    // adapt Next's net Server to http Server
    const httpServer: NetServer = res.socket.server as any;

    // append SocketIO server to Next.js socket server response
    res.socket.server.io = new ServerIO(httpServer, {
      path: '/api/orderbook',
    });

    res.socket.server.io.on('connection', (socket) => {
      console.log('socket id', socket.id);
      // update selected product
      socket.on('change product', (newProduct) => {
        coinbaseClient.ws.unsubscribe({
          name: WebSocketChannelName.LEVEL2,
          product_ids: [selectedProduct],
        });
        selectedProduct = newProduct;
        subscribeToProduct();
      });

      socket.on('close', () => {
        socket.disconnect();
      });

      socket.on('error', () => {
        socket.disconnect();
      });

      coinbaseClient.ws.on(WebSocketEvent.ON_OPEN, () => {
        subscribeToProduct();
      });

      coinbaseClient.ws.on(WebSocketEvent.ON_MESSAGE, (data) => {
        queue.push(data);
        const now = Date.now();
        const timeDiff = now - timeStamp;
        const seconds = timeDiff / 1000;
        if (seconds >= 0.5) {
          queue.splice(0, 10).forEach((update) => {
            const { type } = update;
            socket.emit(type, update);
          });
          timeStamp = Date.now();
        }
      });
    });

    // connect to coinbase websocket
    coinbaseClient.ws.connect();
  }
  res.end();
}
