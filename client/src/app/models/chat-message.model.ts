// chat-message.model.ts
export interface ChatMessage {
  sender: string;  // The ObjectId of the sender
  senderName: string;  // The username to display
  content: string;
  profilePic?: string; // Optional profile picture URL
}

export interface OutgoingMessage {
  senderId: string; // The ObjectId for storage
  senderName: string; // The username for display
  content: string;
  channelId: string;
  profilePic?: string; // Optional profile picture URL
}
