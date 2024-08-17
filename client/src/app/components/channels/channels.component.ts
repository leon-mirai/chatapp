import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ChannelService } from '../../services/channel.service';
import { Channel } from '../../models/channel.model';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-channels',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './channels.component.html',
  styleUrl: './channels.component.css',
})
export class ChannelsComponent implements OnInit {
  channel: Channel | undefined;
  newMemberId: string = '';

  constructor(
    private route: ActivatedRoute,
    private channelService: ChannelService
  ) {}

  ngOnInit(): void {
    const channelId = this.route.snapshot.params['id'];
    if (channelId) {
      this.channel = this.channelService.getChannelById(channelId); 
    }
  }

  addMember() {
    if (this.channel && this.newMemberId.trim()) {
      this.channelService.addMember(this.channel.id, this.newMemberId)
    }
  }
}
