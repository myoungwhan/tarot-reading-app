import { io,Socket } from "socket.io-client";

const URL = 'http://47.236.118.189:80/'; // Update this if needed

export const socket: Socket = io(URL, {
  autoConnect: false, // Connect manually after user joins
});