import { Server as NetServer, Socket } from 'net';
import { NextApiResponse } from 'next';
import { Server as SocketIOServer } from 'socket.io';

export type NextApiResponseServerIO<T = any> = NextApiResponse<T> & {
  selectedProduct: string;
  socket: Socket & {
    server: NetServer & {
      io: SocketIOServer;
    };
  };
};
