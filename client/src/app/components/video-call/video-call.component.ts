import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import Peer, { MediaConnection } from 'peerjs';

@Component({
  selector: 'app-video-call',
  standalone: true,
  imports: [],
  templateUrl: './video-call.component.html',
  styleUrls: ['./video-call.component.css'],
})
export class VideoCallComponent implements OnInit {
  @ViewChild('localVideo') localVideo!: ElementRef<HTMLVideoElement>;
  @ViewChild('remoteVideo') remoteVideo!: ElementRef<HTMLVideoElement>;
  private peer!: Peer;
  private localStream!: MediaStream;
  public peerId: string | undefined; // For displaying the peer ID

  ngOnInit(): void {
    // Initialize PeerJS
    this.peer = new Peer();
    
    // Display the peer ID when the peer connection is open
    this.peer.on('open', (id: string) => {
      this.peerId = id;
    });

    // Handle incoming calls
    this.peer.on('call', (call: MediaConnection) => {
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
        call.on('stream', (remoteStream: MediaStream) => {
          this.remoteVideo.nativeElement.srcObject = remoteStream;
        });
      }
    } catch (error) {
      console.error('Error accessing media devices.', error);
    }
  }
}
