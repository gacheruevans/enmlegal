import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1. Create Author / User
  const author = await prisma.user.upsert({
    where: { email: 'eva.nduta@enmlegal.com' },
    update: {},
    create: {
      email: 'eva.nduta@enmlegal.com',
      name: 'Advocate Eva Nduta Munene',
      role: 'Founding Partner',
      imageUrl: 'profile.png',
    },
  });
  console.log(`Upserted default author: ${author.name}`);

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
        'Navigating the probate process can be emotionally and legally complex, especially after the loss of a loved one. In this article, we break down the key stages of probate administration in Kenya, including obtaining a grant of probate or letters of administration, handling estate assets, settling debts, and distributing inheritance. Whether you\'re an executor, administrator, or beneficiary, this guide will help you understand your rights, responsibilities, and the legal framework involved. Learn how to avoid common pitfalls and ensure a smooth, compliant administration of the deceased’s estate.',
      content:
        'Navigating the probate process can be emotionally and legally complex, especially after the loss of a loved one. In this article, we break down the key stages of probate administration in Kenya, including obtaining a grant of probate or letters of administration, handling estate assets, settling debts, and distributing inheritance. Whether you\'re an executor, administrator, or beneficiary, this guide will help you understand your rights, responsibilities, and the legal framework involved. Learn how to avoid common pitfalls and ensure a smooth, compliant administration of the deceased’s estate.',
      status: 'PUBLISHED',
      date: 'Mar 16, 2025',
      datetime: '2025-03-16',
      categoryName: 'Administration',
    },
    {
      title: 'Real Estate & Conveyancing: A Comprehensive Guide',
      slug: 'real-estate-conveyancing-a-comprehensive-guide',
      description:
        'Buying, selling, or transferring property in Kenya involves intricate legal steps that must be followed to protect your rights. This article demystifies the conveyancing process—covering land searches, sale agreements, title transfers, and registration procedures. Whether you\'re a first-time buyer or seasoned investor, you\'ll gain clarity on the legal safeguards and due diligence needed in every transaction.',
      content:
        'Buying, selling, or transferring property in Kenya involves intricate legal steps that must be followed to protect your rights. This article demystifies the conveyancing process—covering land searches, sale agreements, title transfers, and registration procedures. Whether you\'re a first-time buyer or seasoned investor, you\'ll gain clarity on the legal safeguards and due diligence needed in every transaction.',
      status: 'PUBLISHED',
      date: 'Apr 16, 2025',
      datetime: '2025-04-16',
      categoryName: 'Real Estate',
    },
    {
      title: 'Banking Securities: An Introduction to Banking Securities & Collateral Law in Kenya',
      slug: 'banking-securities-an-introduction-to-banking-securities-collateral-law-in-kenya',
      description:
        'Securing loans with collateral involves detailed legal procedures that protect both lenders and borrowers. This article explores the legal framework around charges, mortgages, debentures, and asset securitization in Kenya. Whether you\'re a financier or business owner, get a clear understanding of your legal obligations and rights under secured lending agreements.',
      content:
        'Securing loans with collateral involves detailed legal procedures that protect both lenders and borrowers. This article explores the legal framework around charges, mortgages, debentures, and asset securitization in Kenya. Whether you\'re a financier or business owner, get a clear understanding of your legal obligations and rights under secured lending agreements.',
      status: 'PUBLISHED',
      date: 'Jun 16, 2025',
      datetime: '2025-06-16',
      categoryName: 'Banking',
    },
    {
      title: 'Dispute Resolution: Effective Strategies for Resolving Legal Conflicts',
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
      title: 'Legal Audit & Compliance: Ensuring Your Business Meets Regulatory Standards',
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
      console.warn(`Category "${post.categoryName}" not found for post "${post.title}"! Skipping...`);
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
