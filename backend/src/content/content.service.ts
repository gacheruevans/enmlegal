import {
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ContentAction, UpdateContentDto } from './content.dto';

export interface DefaultSectionContent {
  section: string;
  title: string;
  subtitle: string;
  subtext?: string;
  cards?: any[];
  status: string;
}

const DEFAULT_SECTIONS: Record<string, DefaultSectionContent> = {
  home: {
    section: 'home',
    title: 'A Personal Legal Practice You Can Trust- In Kenya and from Abroad!',
    subtitle:
      'Providing high-quality legal services with a focus on exceptional client care.',
    status: 'PUBLISHED',
  },
  about: {
    section: 'about',
    title: 'Who we are',
    subtitle:
      'E. Nduta Munene & Company Advocates is a boutique law firm specializing in delivering tailored legal solutions with a personal touch.',
    subtext:
      'Led by Eva Nduta Munene, an accomplished Advocate of the High Court of Kenya with over 14 years of dedicated legal practice, the firm is committed to providing personalized, reliable, and strategic legal solutions to individuals, businesses, and institutions across Kenya and beyond.',
    status: 'PUBLISHED',
  },
  services: {
    section: 'services',
    title: 'Our Practice Areas',
    subtitle:
      'We offer legal services across key areas of law tailored to your needs.',
    subtext:
      'Comprehensive legal representation across corporate, property, family, and dispute resolution domains.',
    status: 'PUBLISHED',
    cards: [
      {
        id: '1',
        title: 'Real Estate & Conveyancing Law',
        subtitle: 'Property & Land Transactions',
        subtext: 'Seamless transactions, from property acquisition to sale.',
        icon: 'HomeModernIcon',
      },
      {
        id: '2',
        title: 'Commercial & Corporate Law',
        subtitle: 'Corporate Governance & Contracts',
        subtext: 'Structuring, compliance, and business advisory.',
        icon: 'ScaleIcon',
      },
      {
        id: '3',
        title: 'Family Law – Divorce & Child Custody',
        subtitle: 'Domestic Relations & Custody',
        subtext:
          'Compassionate, strategic representation for sensitive matters.',
        icon: 'UserGroupIcon',
      },
      {
        id: '4',
        title: 'Legal Audit & Compliance',
        subtitle: 'Regulatory Risk Mitigation',
        subtext: 'Ensuring regulatory alignment and risk mitigation.',
        icon: 'CheckBadgeIcon',
      },
      {
        id: '5',
        title: 'Probate Administration',
        subtitle: 'Estate Administration & Succession',
        subtext:
          'Expert guidance through estate administration and succession.',
        icon: 'BuildingLibraryIcon',
      },
      {
        id: '6',
        title: 'Family-Owned Business & Estate Planning Advisory',
        subtitle: 'Wealth & Succession Advisory',
        subtext:
          'Safeguarding legacy and planning for generational transitions.',
        icon: 'BriefcaseIcon',
      },
      {
        id: '7',
        title: 'Start-Ups & SMEs',
        subtitle: 'Venture Formation & Scaling',
        subtext: 'Supporting entrepreneurs from formation to scale.',
        icon: 'PresentationChartBarIcon',
      },
      {
        id: '8',
        title: 'Dispute Resolution',
        subtitle: 'Mediation, Arbitration & Court',
        subtext:
          'Effective advocacy through negotiation, mediation, and litigation.',
        icon: 'CubeTransparentIcon',
      },
      {
        id: '9',
        title: 'Banking Securities',
        subtitle: 'Financial Transactions & Collateral',
        subtext: 'Structuring and securing financial transactions.',
        icon: 'BanknotesIcon',
      },
    ],
  },
  blog: {
    section: 'blog',
    title: 'From the Blog',
    subtitle:
      'Authoritative legal perspectives, regulatory updates, and commercial guides for Kenya and East Africa.',
    status: 'PUBLISHED',
  },
  contact: {
    section: 'contact',
    title: 'Office Address & Contacts',
    subtitle: 'Advocate Eva Nduta Munene',
    subtext:
      'Block B, 3rd Floor, Suite 3.2, KMA Center, Chyulu Road, Upper Hill, Nairobi, Kenya. P.O. Box 40964-00100. Phone: +254 701-857-030. Email: info@enmlegal.com',
    status: 'PUBLISHED',
  },
};

@Injectable()
export class ContentService implements OnModuleInit {
  private readonly logger = new Logger(ContentService.name);

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    try {
      // 1. Ensure table exists in PostgreSQL without requiring destructive migrations
      await this.prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "SiteContent" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "section" TEXT NOT NULL UNIQUE,
          "title" TEXT,
          "subtitle" TEXT,
          "subtext" TEXT,
          "cards" JSONB,
          "status" TEXT NOT NULL DEFAULT 'PUBLISHED',
          "draftData" JSONB,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
      `);

      await this.prisma.$executeRawUnsafe(`
        CREATE INDEX IF NOT EXISTS "SiteContent_section_idx" ON "SiteContent"("section");
      `);

      // 2. Ensure initial default records exist for all sections
      for (const [key, def] of Object.entries(DEFAULT_SECTIONS)) {
        const existing = await this.prisma.siteContent.findUnique({
          where: { section: key },
        });

        if (!existing) {
          await this.prisma.siteContent.create({
            data: {
              section: def.section,
              title: def.title,
              subtitle: def.subtitle,
              subtext: def.subtext || null,
              cards: def.cards ? (def.cards as Prisma.InputJsonValue) : Prisma.DbNull,
              status: def.status,
            },
          });
          this.logger.log(`Initialized default content for section: ${key}`);
        }
      }

      this.logger.log('SiteContent service initialized and verified.');
    } catch (err: any) {
      this.logger.error(`Error initializing SiteContent table: ${err.message}`);
    }
  }

  /**
   * Returns all published content for public website consumers
   */
  async getPublicContent() {
    try {
      const records = await this.prisma.siteContent.findMany();
      const result: Record<string, any> = {};

      // Seed fallbacks from DEFAULT_SECTIONS if any section is missing from DB
      for (const [sectionKey, defValue] of Object.entries(DEFAULT_SECTIONS)) {
        const dbRecord = records.find((r) => r.section === sectionKey);
        if (dbRecord) {
          result[sectionKey] = {
            section: dbRecord.section,
            title: dbRecord.title,
            subtitle: dbRecord.subtitle,
            subtext: dbRecord.subtext,
            cards: dbRecord.cards,
            status: dbRecord.status,
            updatedAt: dbRecord.updatedAt,
          };
        } else {
          result[sectionKey] = defValue;
        }
      }

      return result;
    } catch (err: any) {
      this.logger.warn(`Failed to read from SiteContent DB, serving defaults: ${err.message}`);
      return DEFAULT_SECTIONS;
    }
  }

  /**
   * Returns public published content for a specific section
   */
  async getSectionPublicContent(section: string) {
    const cleanSection = section.toLowerCase().trim();
    try {
      const record = await this.prisma.siteContent.findUnique({
        where: { section: cleanSection },
      });

      if (record) {
        return {
          section: record.section,
          title: record.title,
          subtitle: record.subtitle,
          subtext: record.subtext,
          cards: record.cards,
          status: record.status,
          updatedAt: record.updatedAt,
        };
      }
    } catch (err: any) {
      this.logger.warn(`Error fetching section ${cleanSection}: ${err.message}`);
    }

    if (DEFAULT_SECTIONS[cleanSection]) {
      return DEFAULT_SECTIONS[cleanSection];
    }

    throw new NotFoundException(`Section ${cleanSection} not found`);
  }

  /**
   * Returns admin view of all sections, including draft data and publication status
   */
  async getAdminContent() {
    const records = await this.prisma.siteContent.findMany({
      orderBy: { section: 'asc' },
    });

    const result: Record<string, any> = {};

    for (const [sectionKey, defValue] of Object.entries(DEFAULT_SECTIONS)) {
      const dbRecord = records.find((r) => r.section === sectionKey);
      if (dbRecord) {
        result[sectionKey] = {
          id: dbRecord.id,
          section: dbRecord.section,
          title: dbRecord.title,
          subtitle: dbRecord.subtitle,
          subtext: dbRecord.subtext,
          cards: dbRecord.cards,
          status: dbRecord.status,
          draftData: dbRecord.draftData,
          hasDraft: !!dbRecord.draftData,
          updatedAt: dbRecord.updatedAt,
        };
      } else {
        result[sectionKey] = {
          ...defValue,
          hasDraft: false,
        };
      }
    }

    return result;
  }

  /**
   * Updates section content with either SAVE_DRAFT or PUBLISH action
   */
  async updateSectionContent(
    section: string,
    dto: UpdateContentDto,
    actorEmail?: string,
  ) {
    const cleanSection = section.toLowerCase().trim();
    const action = dto.action || ContentAction.PUBLISH;

    const existing = await this.prisma.siteContent.findUnique({
      where: { section: cleanSection },
    });

    const currentData = existing || {
      title: DEFAULT_SECTIONS[cleanSection]?.title || '',
      subtitle: DEFAULT_SECTIONS[cleanSection]?.subtitle || '',
      subtext: DEFAULT_SECTIONS[cleanSection]?.subtext || '',
      cards: DEFAULT_SECTIONS[cleanSection]?.cards || null,
    };

    if (action === ContentAction.SAVE_DRAFT) {
      // 1. SAVE AS DRAFT: Save working content to draftData, mark status as DRAFT
      const draftPayload = {
        title: dto.title !== undefined ? dto.title : currentData.title,
        subtitle: dto.subtitle !== undefined ? dto.subtitle : currentData.subtitle,
        subtext: dto.subtext !== undefined ? dto.subtext : currentData.subtext,
        cards: dto.cards !== undefined ? dto.cards : currentData.cards,
        addressDetails: dto.addressDetails,
        savedAt: new Date().toISOString(),
      };

      const updated = await this.prisma.siteContent.upsert({
        where: { section: cleanSection },
        update: {
          draftData: draftPayload,
          status: 'DRAFT',
        },
        create: {
          section: cleanSection,
          title: currentData.title,
          subtitle: currentData.subtitle,
          subtext: currentData.subtext,
          cards: currentData.cards
            ? (currentData.cards as Prisma.InputJsonValue)
            : Prisma.DbNull,
          draftData: draftPayload,
          status: 'DRAFT',
        },
      });

      await this.prisma.activityLog
        .create({
          data: {
            userEmail: actorEmail,
            action: 'CONTENT_DRAFT_SAVED',
            details: `Draft changes saved for section "${cleanSection}" by ${actorEmail || 'Super Admin'}`,
          },
        })
        .catch(() => {});

      return {
        success: true,
        message: `Draft changes for "${cleanSection}" saved successfully. Public site remains on published version.`,
        data: updated,
      };
    } else {
      // 2. PUBLISH: Update live public fields, clear draftData, mark status as PUBLISHED
      const publishTitle =
        dto.title !== undefined ? dto.title : currentData.title;
      const publishSubtitle =
        dto.subtitle !== undefined ? dto.subtitle : currentData.subtitle;
      const publishSubtext =
        dto.subtext !== undefined ? dto.subtext : currentData.subtext;
      const publishCards =
        dto.cards !== undefined ? dto.cards : currentData.cards;

      const updated = await this.prisma.siteContent.upsert({
        where: { section: cleanSection },
        update: {
          title: publishTitle,
          subtitle: publishSubtitle,
          subtext: publishSubtext,
          cards: publishCards
            ? (publishCards as Prisma.InputJsonValue)
            : Prisma.DbNull,
          status: 'PUBLISHED',
          draftData: Prisma.DbNull, // Clear working draft as it is now live
        },
        create: {
          section: cleanSection,
          title: publishTitle,
          subtitle: publishSubtitle,
          subtext: publishSubtext,
          cards: publishCards
            ? (publishCards as Prisma.InputJsonValue)
            : Prisma.DbNull,
          status: 'PUBLISHED',
          draftData: Prisma.DbNull,
        },
      });

      await this.prisma.activityLog
        .create({
          data: {
            userEmail: actorEmail,
            action: 'CONTENT_PUBLISHED',
            details: `Changes published live for section "${cleanSection}" by ${actorEmail || 'Super Admin'}`,
          },
        })
        .catch(() => {});

      return {
        success: true,
        message: `Changes for "${cleanSection}" published live successfully!`,
        data: updated,
      };
    }
  }

  /**
   * Reverts draft changes back to current published version
   */
  async revertDraft(section: string, actorEmail?: string) {
    const cleanSection = section.toLowerCase().trim();

    const existing = await this.prisma.siteContent.findUnique({
      where: { section: cleanSection },
    });

    if (!existing) {
      throw new NotFoundException(`Section ${cleanSection} not found`);
    }

    const updated = await this.prisma.siteContent.update({
      where: { section: cleanSection },
      data: {
        draftData: Prisma.DbNull,
        status: 'PUBLISHED',
      },
    });

    await this.prisma.activityLog
      .create({
        data: {
          userEmail: actorEmail,
          action: 'CONTENT_DRAFT_DISCARDED',
          details: `Draft changes discarded for section "${cleanSection}" by ${actorEmail || 'Super Admin'}`,
        },
      })
      .catch(() => {});

    return {
      success: true,
      message: `Draft changes for "${cleanSection}" reverted to published version.`,
      data: updated,
    };
  }
}
