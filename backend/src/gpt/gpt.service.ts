import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import * as dotenv from 'dotenv';
dotenv.config();
@Injectable()
export class GptService {
  private openai: OpenAI;
  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is not defined in environment variables');
    }
    this.openai = new OpenAI({ apiKey: apiKey });
  }

  async chatWithGPT(message: string) {
    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful legal assistant for Kenya law.',
          },
          {
            role: 'user',
            content: message,
          },
        ],
      });
      if (!response.choices || response.choices.length === 0) {
        throw new Error('No response from OpenAI');
      }
      return response.choices[0].message?.content || '';
    } catch (error) {
      console.error('Error communicating with OpenAI:', error);
      throw new Error('Failed to get response from OpenAI');
    }
  }
}
