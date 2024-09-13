// socket.service.ts
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';

interface ChatMessage {
  sender: string;
  content: string;
}

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  private socket: Socket;

  constructor() {
    // Connect to the server
    this.socket = io('http://localhost:3000');
  }

  // Method to send a structured message (ChatMessage object)
  sendMessage(message: ChatMessage): void {
    this.socket.emit('message', message);
  }

  // Method to receive structured messages from the server
  getMessages(): Observable<ChatMessage> {
    return new Observable<ChatMessage>((observer) => {
      this.socket.on('message', (message: ChatMessage) => {
        observer.next(message);
      });
    });
  }
}
