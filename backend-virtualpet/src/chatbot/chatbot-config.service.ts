import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const TTL_MS = 5 * 60 * 1000; // 5 minutos

interface ConfigCache {
  systemPrompt: string;
  companyInfo:  Record<string, string>;
  expiresAt:    number;
}

@Injectable()
export class ChatbotConfigService {
  private readonly logger = new Logger(ChatbotConfigService.name);
  private cache: ConfigCache | null = null;

  constructor(private readonly prisma: PrismaService) {}

  async getSystemPrompt(): Promise<string> {
    return (await this.load()).systemPrompt;
  }

  async getCompanyInfo(): Promise<Record<string, string>> {
    return (await this.load()).companyInfo;
  }

  private async load(): Promise<ConfigCache> {
    const now = Date.now();
    if (this.cache && now < this.cache.expiresAt) {
      return this.cache;
    }

    this.logger.debug('Loading chatbot config from DB');
    const row = await this.prisma.chatbotConfig.findUniqueOrThrow({ where: { id: 'default' } });

    this.cache = {
      systemPrompt: row.systemPrompt,
      companyInfo:  row.companyInfo as Record<string, string>,
      expiresAt:    now + TTL_MS,
    };
    return this.cache;
  }
}
