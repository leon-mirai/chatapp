import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  private socket: Socket;

  constructor() {
    // Connect to the server with the appropriate namespace for channels
    this.socket = io('http://localhost:3000');
  }

  // Method to send a message to the server
  sendMessage(message: string): void {
    this.socket.emit('message', message);
  }

  // Method to receive messages from the server
  getMessages(): Observable<string> {
    return new Observable<string>((observer) => {
      this.socket.on('message', (message: string) => {
        observer.next(message);
      });
    });
  }

  // Disconnect the socket connection when leaving the channel
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
    }
  }
}
