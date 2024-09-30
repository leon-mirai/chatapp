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
  private currentCall!: MediaConnection; 
  public peerId: string | undefined; 

  ngOnInit(): void {
    // initialize PeerJS
    this.peer = new Peer();

    // display the peer ID when the peer connection is open
    this.peer.on('open', (id: string) => {
      this.peerId = id;
    });

    // handle incoming calls
    this.peer.on('call', (call: MediaConnection) => {
      // store the current call
      this.currentCall = call;

      // answer the call with the local video stream
      call.answer(this.localStream);
      call.on('stream', (remoteStream: MediaStream) => {
        this.remoteVideo.nativeElement.srcObject = remoteStream;
      });
    });
  }

  async startCall(): Promise<void> {
    try {
      // get the local video stream
      this.localStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      this.localVideo.nativeElement.srcObject = this.localStream;

      // make a call to the remote peer
      const remotePeerId = prompt('Enter the remote peer ID:');
      if (remotePeerId) {
        const call = this.peer.call(remotePeerId, this.localStream);

        // store the current call
        this.currentCall = call;

        call.on('stream', (remoteStream: MediaStream) => {
          this.remoteVideo.nativeElement.srcObject = remoteStream;
        });
      }
    } catch (error) {
      console.error('Error accessing media devices.', error);
    }
  }

  // method to end the call
  endCall(): void {
    if (this.currentCall) {
      // close the call
      this.currentCall.close();

      // stop all tracks of the local stream
      if (this.localStream) {
        this.localStream.getTracks().forEach((track) => track.stop());
      }

      // clear the video elements
      this.localVideo.nativeElement.srcObject = null;
      this.remoteVideo.nativeElement.srcObject = null;

      console.log('Call ended.');
    }
  }
}
