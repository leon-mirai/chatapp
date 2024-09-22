import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';
import { ChatMessage, OutgoingMessage } from '../models/chat-message.model'; // Import both interfaces

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  private socket: Socket;

  // socket.service.ts
  constructor() {
    this.socket = io(); 
  }

  // Send a message to the server
  sendMessage(message: OutgoingMessage): void {
    this.socket.emit('message', message);
  }

  // Receive messages from the server
  getMessages(): Observable<ChatMessage> {
    return new Observable<ChatMessage>((observer) => {
      this.socket.on('message', (message: ChatMessage) => {
        observer.next(message);
      });
    });
  }
}
