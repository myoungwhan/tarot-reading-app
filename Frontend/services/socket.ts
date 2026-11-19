import { io,Socket } from "socket.io-client";
import { API_BASE_URL } from './api';

const socketOrigin = new URL(API_BASE_URL, window.location.origin).origin;

export const socket: Socket = io(socketOrigin, {
  autoConnect: false, // Connect manually after user joins
});
