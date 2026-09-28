import { Injectable, Logger } from '@nestjs/common';
import OpenAI from 'openai';
import { ChatDto } from './dto/chat.dto';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);
  private openai: OpenAI | null = null;

  private readonly systemPrompt = `You are the AI Legal Assistant for ENM Legal, a premier law firm based in Nairobi, Kenya, founded by Advocate Eva Nduta Munene.

Key Practice Areas of ENM Legal:
1. Probate Administration & Succession: Guiding executors, administrators, and beneficiaries under Kenyan Succession Act, wills, petitions for grant of probate, and estate distribution.
2. Real Estate & Conveyancing: Land searches, sales agreements, transfers, due diligence, lease agreements, and registration at Ministry of Lands under Kenyan land law.
3. Banking Securities & Collateral Law: Charges, mortgages, debentures, loan agreements, and legal audits for financial institutions and borrowers.
4. Startups & SMEs Commercial Law: Company incorporation under the Companies Act 2015, shareholder agreements, founder contracts, compliance, IP protection.
5. Dispute Resolution: Alternative Dispute Resolution (ADR), mediation, arbitration, and civil litigation strategies.
6. Legal Audit & Regulatory Compliance: Ensuring business practices comply with Kenyan laws and statutory regulations.

Guidelines:
- Answer queries politely, authoritatively, and concisely.
- Ground advice in Kenyan jurisprudence and relevant statutes where applicable (e.g. Law of Succession Act, Land Registration Act 2012, Companies Act 2015).
- Always include a courteous disclaimer that this provides general legal information and encourage booking a direct consultation with Advocate Eva Nduta Munene through the website booking tool.
`;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (apiKey && apiKey.trim().length > 0 && !apiKey.startsWith('sk-placeholder')) {
      this.openai = new OpenAI({ apiKey });
      this.logger.log('OpenAI client successfully initialized for ChatService.');
    } else {
      this.logger.warn(
        'OPENAI_API_KEY is not set or empty. ChatService will operate in intelligent fallback guidance mode.',
      );
    }
  }

  async generateReply(dto: ChatDto): Promise<{ reply: string }> {
    if (!this.openai) {
      return {
        reply: this.getFallbackReply(dto.message),
      };
    }

    try {
      const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
        { role: 'system', content: this.systemPrompt },
      ];

      if (dto.history && dto.history.length > 0) {
        // Include last 8 messages for context
        const recentHistory = dto.history.slice(-8);
        for (const msg of recentHistory) {
          if (msg.role === 'user' || msg.role === 'assistant') {
            messages.push({
              role: msg.role,
              content: msg.content,
            });
          }
        }
      }

      messages.push({ role: 'user', content: dto.message });

      const response = await this.openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        messages,
        temperature: 0.7,
        max_tokens: 600,
      });

      const reply =
        response.choices[0]?.message?.content ||
        'Thank you for contacting ENM Legal. Please book a consultation for tailored legal counsel.';

      return { reply };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.error(`OpenAI chat generation failed: ${message}`);
      return {
        reply: this.getFallbackReply(dto.message),
      };
    }
  }

  private getFallbackReply(userMessage: string): string {
    const lower = userMessage.toLowerCase();

    if (lower.includes('probate') || lower.includes('succession') || lower.includes('will') || lower.includes('estate')) {
      return `Probate and estate administration in Kenya is governed primarily by the Law of Succession Act (Cap 160). When an individual passes on, the appointed executors or immediate beneficiaries must petition the High Court or relevant Magistrate's Court for a Grant of Probate (where there is a valid Will) or Letters of Administration Intestate (where there is no Will).

ENM Legal routinely assists families with drafting wills, asset identification, filing court petitions, and final estate distribution.

*Notice: This is general legal information. For tailored legal counsel, please click 'Book a Consultation' on our website.*`;
    }

    if (lower.includes('land') || lower.includes('conveyanc') || lower.includes('title') || lower.includes('property') || lower.includes('buy') || lower.includes('sell')) {
      return `Property transactions in Kenya require rigorous due diligence under the Land Registration Act 2012 and the Sectional Properties Act. Key steps include conducting official land registry searches, verifying land rates and rent clearances, preparing the Sale Agreement, and handling stamp duty valuation and final title registration.

ENM Legal provides comprehensive conveyancing services for individual buyers, sellers, and corporate developers.

*Notice: This is general legal information. For tailored legal counsel, please click 'Book a Consultation' on our website.*`;
    }

    if (lower.includes('startup') || lower.includes('company') || lower.includes('business') || lower.includes('contract') || lower.includes('incorporat')) {
      return `Under the Kenya Companies Act 2015, businesses can register private limited companies, partnerships, or business names via the BRS (Business Registration Service) on eCitizen. Critical legal protections for founders include founder shareholder agreements, non-disclosure agreements (NDAs), intellectual property assignments, and commercial contracts.

ENM Legal advises Kenyan startups and SMEs from inception through scale.

*Notice: This is general legal information. For tailored legal counsel, please click 'Book a Consultation' on our website.*`;
    }

    return `Thank you for reaching out to ENM Legal Advocates. We specialize in Probate & Succession, Real Estate & Conveyancing, Banking Securities, Commercial Law, Dispute Resolution, and Legal Audits in Kenya.

To discuss your specific matter directly with Advocate Eva Nduta Munene, please use our 'Book a Consultation' feature to schedule a meeting.`;
  }
}
