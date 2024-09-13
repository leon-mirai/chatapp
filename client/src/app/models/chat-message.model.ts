// Interface for incoming chat messages
export interface ChatMessage {
    sender: string;  // The username to display
    content: string; // The actual message content
  }
  
  // Interface for outgoing messages
  export interface OutgoingMessage {
    senderId: string;    // The ObjectId of the sender
    senderName: string;  // The username to display
    content: string;     // The actual message content
    channelId: string;   // The ID of the channel the message is being sent to
  }
  