import { Test, TestingModule } from '@nestjs/testing';
import { ChatService } from './chat.service';

describe('ChatService', () => {
  let service: ChatService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChatService],
    }).compile();

    service = module.get<ChatService>(ChatService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return intelligent fallback for succession queries when API key is unset', async () => {
    const res = await service.generateReply({
      message: 'How do I file for probate and succession in Kenya?',
    });
    expect(res).toBeDefined();
    expect(res.reply).toContain('Law of Succession Act');
  });

  it('should return intelligent fallback for land conveyancing queries', async () => {
    const res = await service.generateReply({
      message: 'What is the process for land conveyancing and title transfer in Nairobi?',
    });
    expect(res).toBeDefined();
    expect(res.reply).toContain('Land Registration Act');
  });
});
