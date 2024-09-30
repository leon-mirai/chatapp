// chat-message.model.ts
export interface ChatMessage {
  sender: string; 
  senderName: string; 
  content: string;
  profilePic?: string; // profile picture URL
}

export interface OutgoingMessage {
  senderId: string; 
  senderName: string; 
  content: string;
  channelId: string;
  profilePic?: string; 
}
