import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import Peer, { MediaConnection } from 'peerjs';

@Component({
  selector: 'app-video-call',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './video-call.component.html',
  styleUrls: ['./video-call.component.css'],
})
export class VideoCallComponent implements OnInit {
  @ViewChild('localVideo') localVideo!: ElementRef<HTMLVideoElement>;
  @ViewChild('remoteVideo') remoteVideo!: ElementRef<HTMLVideoElement>;
  private peer!: Peer;
  private localStream!: MediaStream;
  private currentCall!: MediaConnection; // Store the current call
  public peerId: string | undefined; // For displaying the peer ID

  ngOnInit(): void {
    // Initialize PeerJS
    this.peer = new Peer({
      host: '2b6f-132-234-229-55.ngrok-free.app', 
      port: 443,                     
      path: '/peerjs',
      secure: true                   
    });
    
    
    // Display the peer ID when the peer connection is open
    this.peer.on('open', (id: string) => {
      this.peerId = id;
    });

    // Handle incoming calls
    this.peer.on('call', (call: MediaConnection) => {
      // Store the current call
      this.currentCall = call;

      // Answer the call with the local video stream
      call.answer(this.localStream);
      call.on('stream', (remoteStream: MediaStream) => {
        this.remoteVideo.nativeElement.srcObject = remoteStream;
      });
    });
  }

  async startCall(): Promise<void> {
    try {
      // Get the local video stream
      this.localStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      this.localVideo.nativeElement.srcObject = this.localStream;

      // Make a call to the remote peer
      const remotePeerId = prompt('Enter the remote peer ID:');
      if (remotePeerId) {
        const call = this.peer.call(remotePeerId, this.localStream);

        // Store the current call
        this.currentCall = call;

        call.on('stream', (remoteStream: MediaStream) => {
          this.remoteVideo.nativeElement.srcObject = remoteStream;
        });
      }
    } catch (error) {
      console.error('Error accessing media devices.', error);
    }
  }

  // Method to end the call
  endCall(): void {
    if (this.currentCall) {
      // Close the call
      this.currentCall.close();

      // Stop all tracks of the local stream
      if (this.localStream) {
        this.localStream.getTracks().forEach(track => track.stop());
      }

      // Clear the video elements
      this.localVideo.nativeElement.srcObject = null;
      this.remoteVideo.nativeElement.srcObject = null;

      console.log('Call ended.');
    }
  }
}
