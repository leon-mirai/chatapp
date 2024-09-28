import { TestBed } from '@angular/core/testing';
import { ChannelService } from './channel.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Channel } from '../models/channel.model';
import { CreateChannel } from '../models/create-channel.model';
import { ChatMessage } from '../models/chat-message.model';

describe('ChannelService', () => {
  let service: ChannelService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ChannelService],
    });

    service = TestBed.inject(ChannelService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch all channels', () => {
    const mockChannels: Channel[] = [
      {
        _id: '1',
        name: 'General',
        groupId: '1',
        members: [],
        joinRequests: [],
        blacklist: [],
        messages: []
      },
      {
        _id: '2',
        name: 'Random',
        groupId: '2',
        members: [],
        joinRequests: [],
        blacklist: [],
        messages: []
      }
    ];

    service.getChannels().subscribe((channels) => {
      expect(channels.length).toBe(2);
      expect(channels).toEqual(mockChannels);
    });

    const req = httpMock.expectOne(service['apiUrl']);
    expect(req.request.method).toBe('GET');
    req.flush(mockChannels);
  });

  it('should fetch a specific channel by ID', () => {
    const mockChannel: Channel = {
      _id: '1',
      name: 'General',
      groupId: '1',
      members: [],
      joinRequests: [],
      blacklist: [],
      messages: []
    };

    service.getChannelById('1').subscribe((channel) => {
      expect(channel).toEqual(mockChannel);
    });

    const req = httpMock.expectOne(`${service['apiUrl']}/1`);
    expect(req.request.method).toBe('GET');
    req.flush(mockChannel);
  });

  it('should fetch channels by group ID', () => {
    const mockChannels: Channel[] = [
      {
        _id: '1',
        name: 'General',
        groupId: '1',
        members: [],
        joinRequests: [],
        blacklist: [],
        messages: []
      }
    ];

    service.getChannelsByGroupId('1').subscribe((channels) => {
      expect(channels.length).toBe(1);
      expect(channels).toEqual(mockChannels);
    });

    const req = httpMock.expectOne(`${service['apiUrl']}/group/1`);
    expect(req.request.method).toBe('GET');
    req.flush(mockChannels);
  });

  it('should add a new channel', () => {
    const newChannel: CreateChannel = {
      name: 'New Channel',
      groupId: '1',
      members: ['user1'],
      channels: [], 
      joinRequests: [],
      blacklist: []
    };

    const mockResponse: Channel = {
      _id: '123',
      name: newChannel.name,
      groupId: newChannel.groupId,
      members: newChannel.members,
      joinRequests: newChannel.joinRequests,
      blacklist: newChannel.blacklist,
      messages: []
    };

    service.addChannel(newChannel).subscribe((channel) => {
      expect(channel).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(service['apiUrl']);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(newChannel);
    req.flush(mockResponse);
  });

  it('should delete a channel by ID', () => {
    const mockResponse = { success: true };

    service.deleteChannel('1').subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${service['apiUrl']}/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(mockResponse);
  });

  it('should request to join a channel', () => {
    const mockResponse = { success: true };

    service.joinChannel('1', 'user123').subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${service['apiUrl']}/1/request-join`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ userId: 'user123' });
    req.flush(mockResponse);
  });

  it('should ban a user from the channel', () => {
    const mockResponse = { success: true };

    service.banUser('1', 'user123').subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${service['apiUrl']}/1/ban`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ userId: 'user123' });
    req.flush(mockResponse);
  });

  it('should remove a user from a channel', () => {
    const mockResponse = { success: true };

    service.removeUserFromChannel('1', 'user123').subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${service['apiUrl']}/1/members/user123`);
    expect(req.request.method).toBe('DELETE');
    req.flush(mockResponse);
  });

  it('should approve a user join request', () => {
    const mockResponse = { success: true };

    service.approveJoinRequest('1', 'user123', true).subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${service['apiUrl']}/1/approve-join`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ userId: 'user123', approve: true });
    req.flush(mockResponse);
  });

  it('should fetch chat history for a channel', () => {
    const mockMessages: ChatMessage[] = [
      { sender: 'user1', senderName: 'User 1', content: 'Hello' },
      { sender: 'user2', senderName: 'User 2', content: 'Hi' }
    ];

    service.getChatHistory('1').subscribe((messages) => {
      expect(messages.length).toBe(2);
      expect(messages).toEqual(mockMessages);
    });

    const req = httpMock.expectOne(`${service['apiUrl']}/1/messages`);
    expect(req.request.method).toBe('GET');
    req.flush(mockMessages);
  });
});
