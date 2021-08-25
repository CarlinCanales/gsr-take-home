import express, { Express } from 'express';
import * as http from 'http';
import next, { NextApiHandler } from 'next';
import { Server, Socket } from 'socket.io';

const port = parseInt(process.env.PORT || '3000', 10);
const dev = process.env.NODE_ENV !== 'production';
const nextApp = next({ dev });
const nextHandler: NextApiHandler = nextApp.getRequestHandler();

nextApp.prepare().then(async () => {
  const app: Express = express();
  const server: http.Server = http.createServer(app);
  const io: Server = new Server();
  io.attach(server);

  io.on('connection', (socket: Socket) => {
    console.log('connection');
    socket.emit('status', 'Hello from Socket.io');
    socket.on('change product', (product) => {
      console.log('product is', product);
    });
  });

  app.all('*', (req: any, res: any) => nextHandler(req, res));

  server.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
  });
});
