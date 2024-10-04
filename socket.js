import { io } from 'socket.io-client';

export const socket = io('https://api.athleticslabs.site:8802', {transports: ["websocket"],  reconnection: true,
});