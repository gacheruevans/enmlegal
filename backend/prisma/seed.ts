import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding database...');

  const superAdminPassword = await bcrypt.hash('@1234Eii!', 10);
  const adminPassword = await bcrypt.hash('Admin@1234!', 10);
  const authorPassword = await bcrypt.hash('Password@123!', 10);

  // 1. Create Author / User
  const author = await prisma.user.upsert({
    where: { email: 'eva.nduta@enmlegal.com' },
    update: {
      password: authorPassword,
      isActive: true,
      role: 'ADMIN',
    },
    create: {
      email: 'eva.nduta@enmlegal.com',
      name: 'Advocate Eva Nduta Munene',
      role: 'ADMIN',
      imageUrl: 'profile.png',
      password: authorPassword,
    },
  });
  console.log(`Upserted default author: ${author.name}`);

  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@pentaclover.co.ke' },
    update: {
      name: 'Super Admin',
      role: 'SUPERADMIN',
      password: superAdminPassword,
      isActive: true,
    },
    create: {
      email: 'admin@pentaclover.co.ke',
      name: 'Super Admin',
      role: 'SUPERADMIN',
      password: superAdminPassword,
      isActive: true,
    },
  });
  console.log(`Upserted super admin: ${superAdmin.email}`);

  const admin = await prisma.user.upsert({
    where: { email: 'editor@pentaclover.co.ke' },
    update: {
      name: 'Admin User',
      role: 'ADMIN',
      password: adminPassword,
      isActive: true,
    },
    create: {
      email: 'editor@pentaclover.co.ke',
      name: 'Admin User',
      role: 'ADMIN',
      password: adminPassword,
      isActive: true,
    },
  });
  console.log(`Upserted admin: ${admin.email}`);

  const testPassword = await bcrypt.hash('Password123!', 10);
  const testUser = await prisma.user.upsert({
    where: { email: 'test@enmlegal.com' },
    update: {
      name: 'Test Admin',
      role: 'ADMIN',
      password: testPassword,
      isActive: true,
    },
    create: {
      email: 'test@enmlegal.com',
      name: 'Test Admin',
      role: 'ADMIN',
      password: testPassword,
      isActive: true,
    },
  });
  console.log(`Upserted test user: ${testUser.email}`);

  // 2. Create Categories
  const categoriesData = [
    { title: 'Administration', slug: 'administration' },
    { title: 'Real Estate', slug: 'realestate' },
    { title: 'Banking', slug: 'banking' },
    { title: 'Social', slug: 'social' },
    { title: 'Startups', slug: 'startups' },
    { title: 'Audits', slug: 'audits' },
  ];

  const categoriesMap: Record<string, any> = {};
  for (const cat of categoriesData) {
    const dbCat = await prisma.category.upsert({
      where: { title: cat.title },
      update: {},
      create: {
        title: cat.title,
        slug: cat.slug,
      },
    });
    categoriesMap[cat.title] = dbCat;
  }
  console.log(`Upserted ${categoriesData.length} categories.`);

  // 3. Create Posts
  const postsData = [
    {
      title: 'Probate Administration: Navigating the Legal Landscape',
      slug: 'probate-administration-navigating-the-legal-landscape',
      description:
        "Navigating the probate process can be emotionally and legally complex, especially after the loss of a loved one. In this article, we break down the key stages of probate administration in Kenya, including obtaining a grant of probate or letters of administration, handling estate assets, settling debts, and distributing inheritance. Whether you're an executor, administrator, or beneficiary, this guide will help you understand your rights, responsibilities, and the legal framework involved. Learn how to avoid common pitfalls and ensure a smooth, compliant administration of the deceased’s estate.",
      content:
        "Navigating the probate process can be emotionally and legally complex, especially after the loss of a loved one. In this article, we break down the key stages of probate administration in Kenya, including obtaining a grant of probate or letters of administration, handling estate assets, settling debts, and distributing inheritance. Whether you're an executor, administrator, or beneficiary, this guide will help you understand your rights, responsibilities, and the legal framework involved. Learn how to avoid common pitfalls and ensure a smooth, compliant administration of the deceased’s estate.",
      status: 'PUBLISHED',
      date: 'Mar 16, 2025',
      datetime: '2025-03-16',
      categoryName: 'Administration',
    },
    {
      title: 'Real Estate & Conveyancing: A Comprehensive Guide',
      slug: 'real-estate-conveyancing-a-comprehensive-guide',
      description:
        "Buying, selling, or transferring property in Kenya involves intricate legal steps that must be followed to protect your rights. This article demystifies the conveyancing process—covering land searches, sale agreements, title transfers, and registration procedures. Whether you're a first-time buyer or seasoned investor, you'll gain clarity on the legal safeguards and due diligence needed in every transaction.",
      content:
        "Buying, selling, or transferring property in Kenya involves intricate legal steps that must be followed to protect your rights. This article demystifies the conveyancing process—covering land searches, sale agreements, title transfers, and registration procedures. Whether you're a first-time buyer or seasoned investor, you'll gain clarity on the legal safeguards and due diligence needed in every transaction.",
      status: 'PUBLISHED',
      date: 'Apr 16, 2025',
      datetime: '2025-04-16',
      categoryName: 'Real Estate',
    },
    {
      title:
        'Banking Securities: An Introduction to Banking Securities & Collateral Law in Kenya',
      slug: 'banking-securities-an-introduction-to-banking-securities-collateral-law-in-kenya',
      description:
        "Securing loans with collateral involves detailed legal procedures that protect both lenders and borrowers. This article explores the legal framework around charges, mortgages, debentures, and asset securitization in Kenya. Whether you're a financier or business owner, get a clear understanding of your legal obligations and rights under secured lending agreements.",
      content:
        "Securing loans with collateral involves detailed legal procedures that protect both lenders and borrowers. This article explores the legal framework around charges, mortgages, debentures, and asset securitization in Kenya. Whether you're a financier or business owner, get a clear understanding of your legal obligations and rights under secured lending agreements.",
      status: 'PUBLISHED',
      date: 'Jun 16, 2025',
      datetime: '2025-06-16',
      categoryName: 'Banking',
    },
    {
      title:
        'Dispute Resolution: Effective Strategies for Resolving Legal Conflicts',
      slug: 'dispute-resolution-effective-strategies-for-resolving-legal-conflicts',
      description:
        'Disputes are inevitable—but how you resolve them makes all the difference. This article compares mediation, arbitration, and litigation in Kenya, offering guidance on the most efficient and cost-effective approach for different legal scenarios. Learn how to resolve disputes while preserving relationships and minimizing disruptions.',
      content:
        'Disputes are inevitable—but how you resolve them makes all the difference. This article compares mediation, arbitration, and litigation in Kenya, offering guidance on the most efficient and cost-effective approach for different legal scenarios. Learn how to resolve disputes while preserving relationships and minimizing disruptions.',
      status: 'PUBLISHED',
      date: 'Apr 16, 2024',
      datetime: '2024-04-16',
      categoryName: 'Social',
    },
    {
      title: 'Startups & SMEs: Legal Essentials for Entrepreneurs',
      slug: 'startups-smes-legal-essentials-for-entrepreneurs',
      description:
        'From registration to funding to IP protection, startups face unique legal challenges. This article outlines the core legal steps for launching and scaling a business in Kenya—covering company formation, contracts, compliance, and investor readiness. Empower your venture with the legal tools for sustainable growth.',
      content:
        'From registration to funding to IP protection, startups face unique legal challenges. This article outlines the core legal steps for launching and scaling a business in Kenya—covering company formation, contracts, compliance, and investor readiness. Empower your venture with the legal tools for sustainable growth.',
      status: 'PUBLISHED',
      date: 'May 16, 2024',
      datetime: '2024-05-16',
      categoryName: 'Startups',
    },
    {
      title:
        'Legal Audit & Compliance: Ensuring Your Business Meets Regulatory Standards',
      slug: 'legal-audit-compliance-ensuring-your-business-meets-regulatory-standards',
      description:
        'A legal audit isn’t just about checking boxes—it’s about protecting your organization. This article explains how legal audits identify regulatory gaps, strengthen internal controls, and prevent costly penalties. Ideal for growing enterprises, NGOs, and corporates seeking to stay ahead of compliance risks in Kenya’s evolving legal landscape.',
      content:
        'A legal audit isn’t just about checking boxes—it’s about protecting your organization. This article explains how legal audits identify regulatory gaps, strengthen internal controls, and prevent costly penalties. Ideal for growing enterprises, NGOs, and corporates seeking to stay ahead of compliance risks in Kenya’s evolving legal landscape.',
      status: 'PUBLISHED',
      date: 'Jun 16, 2024',
      datetime: '2024-06-16',
      categoryName: 'Audits',
    },
  ];

  for (const post of postsData) {
    const category = categoriesMap[post.categoryName];
    if (!category) {
      console.warn(
        `Category "${post.categoryName}" not found for post "${post.title}"! Skipping...`,
      );
      continue;
    }

    await prisma.post.upsert({
      where: { slug: post.slug },
      update: {},
      create: {
        title: post.title,
        slug: post.slug,
        description: post.description,
        content: post.content,
        imageUrl: null,
        status: post.status,
        date: post.date,
        datetime: post.datetime,
        categoryId: category.id,
        authorId: author.id,
      },
    });
  }
  console.log(`Upserted ${postsData.length} posts.`);

  // 4. Seed SiteContent
  const siteContents = [
    {
      section: 'home',
      title: 'A Personal Legal Practice You Can Trust- In Kenya and from Abroad!',
      subtitle: 'Providing high-quality legal services with a focus on exceptional client care.',
      subtext: null,
      cards: null,
      status: 'PUBLISHED',
    },
    {
      section: 'about',
      title: 'Who we are',
      subtitle: 'E. Nduta Munene & Company Advocates is a boutique law firm specializing in delivering tailored legal solutions with a personal touch.',
      subtext: 'Led by Eva Nduta Munene, an accomplished Advocate of the High Court of Kenya with over 14 years of dedicated legal practice, the firm is committed to providing personalized, reliable, and strategic legal solutions to individuals, businesses, and institutions across Kenya and beyond.',
      cards: null,
      status: 'PUBLISHED',
    },
    {
      section: 'services',
      title: 'Our Practice Areas',
      subtitle: 'We offer legal services across key areas of law tailored to your needs.',
      subtext: 'Comprehensive legal representation across corporate, property, family, and dispute resolution domains.',
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
          subtext: 'Compassionate, strategic representation for sensitive matters.',
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
          subtext: 'Expert guidance through estate administration and succession.',
          icon: 'BuildingLibraryIcon',
        },
        {
          id: '6',
          title: 'Family-Owned Business & Estate Planning Advisory',
          subtitle: 'Wealth & Succession Advisory',
          subtext: 'Safeguarding legacy and planning for generational transitions.',
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
          subtext: 'Effective advocacy through negotiation, mediation, and litigation.',
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
      status: 'PUBLISHED',
    },
    {
      section: 'blog',
      title: 'From the Blog',
      subtitle: 'Authoritative legal perspectives, regulatory updates, and commercial guides for Kenya and East Africa.',
      subtext: null,
      cards: null,
      status: 'PUBLISHED',
    },
    {
      section: 'contact',
      title: 'Office Address & Contacts',
      subtitle: 'Advocate Eva Nduta Munene',
      subtext: 'Block B, 3rd Floor, Suite 3.2, KMA Center, Chyulu Road, Upper Hill, Nairobi, Kenya. P.O. Box 40964-00100. Phone: +254 701-857-030. Email: info@enmlegal.com',
      cards: null,
      status: 'PUBLISHED',
    },
  ];

  for (const item of siteContents) {
    await prisma.siteContent.upsert({
      where: { section: item.section },
      update: {},
      create: {
        section: item.section,
        title: item.title,
        subtitle: item.subtitle,
        subtext: item.subtext,
        cards: item.cards ?? undefined,
        status: item.status,
      },
    });
  }
  console.log(`Upserted ${siteContents.length} site content sections.`);

  console.log('Database seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
