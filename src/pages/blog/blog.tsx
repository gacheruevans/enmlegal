import React, {useRef} from 'react'


const posts = [
    {
      id: 1,
      title: 'Probate Administration: Navigating the Legal Landscape',
      href: '#',
      description:
        "Navigating the probate process can be emotionally and legally complex, especially after the loss of a loved one. In this article, we break down the key stages of probate administration in Kenya, including obtaining a grant of probate or letters of administration, handling estate assets, settling debts, and distributing inheritance. Whether you're an executor, administrator, or beneficiary, this guide will help you understand your rights, responsibilities, and the legal framework involved. Learn how to avoid common pitfalls and ensure a smooth, compliant administration of the deceased’s estate.",
      date: 'Mar 16, 2025',
      datetime: '2020-03-16',
      category: { title: 'Administration', href: '#' },
      author: {
        name: 'Advocate Eva Nduta Munene',
        role: 'Founding Partner',
        href: '#',
        imageUrl:
          '/profile.png',
      },
    },
    {
      id: 2,
      title: 'Real Estate & Conveyancing: A Comprehensive Guide',
      href: '#',
      description:
        "Buying, selling, or transferring property in Kenya involves intricate legal steps that must be followed to protect your rights. This article demystifies the conveyancing process—covering land searches, sale agreements, title transfers, and registration procedures. Whether you're a first-time buyer or seasoned investor, you'll gain clarity on the legal safeguards and due diligence needed in every transaction.",
      date: 'Apr 16, 2025',
      datetime: '2020-03-16',
      category: { title: 'Realestate', href: '#' },
      author: {
        name: 'Advocate Eva Nduta Munene',
        role: 'Founding Partner',
        href: '#',
        imageUrl:
          '/profile.png',
      },
    },
    {
      id: 3,
      title: 'Banking Securities: An Introduction to Banking Securities & Collateral Law in Kenya',
      href: '#',
      description:
        "Securing loans with collateral involves detailed legal procedures that protect both lenders and borrowers. This article explores the legal framework around charges, mortgages, debentures, and asset securitization in Kenya. Whether you're a financier or business owner, get a clear understanding of your legal obligations and rights under secured lending agreements.",
      date: 'Jun 16, 2025',
      datetime: '2020-03-16',
      category: { title: 'Banking', href: '#' },
      author: {
        name: 'Advocate Eva Nduta Munene',
        role: 'Founding Partner',
        href: '#',
        imageUrl:
          '/profile.png',
      },
    },
    {
      id: 4,
      title: 'Dispute Resolution: Effective Strategies for Resolving Legal Conflicts',
      href: '#',
      description:
        "Disputes are inevitable—but how you resolve them makes all the difference. This article compares mediation, arbitration, and litigation in Kenya, offering guidance on the most efficient and cost-effective approach for different legal scenarios. Learn how to resolve disputes while preserving relationships and minimizing disruptions.",
      date: 'Apr 16, 2024',
      datetime: '2020-03-16',
      category: { title: 'Social', href: '#' },
      author: {
        name: 'Advocate Eva Nduta Munene',
        role: 'Founding Partner',
        href: '#',
        imageUrl:
          '/profile.png',
      },
    },
    {
      id: 5,
      title: 'Startups & SMEs: Legal Essentials for Entrepreneurs',
      href: '#',
      description:
        "From registration to funding to IP protection, startups face unique legal challenges. This article outlines the core legal steps for launching and scaling a business in Kenya—covering company formation, contracts, compliance, and investor readiness. Empower your venture with the legal tools for sustainable growth.",
      date: 'May 16, 2024',
      datetime: '2020-03-16',
      category: { title: 'Startups', href: '#' },
      author: {
        name: 'Advocate Eva Nduta Munene',
        role: 'Founding Partner',
        href: '#',
        imageUrl:
          '/profile.png',
      },
    },
    {
      id: 6,
      title: 'Legal Audit & Compliance: Ensuring Your Business Meets Regulatory Standards',
      href: '#',
      description:
        "A legal audit isn’t just about checking boxes—it’s about protecting your organization. This article explains how legal audits identify regulatory gaps, strengthen internal controls, and prevent costly penalties. Ideal for growing enterprises, NGOs, and corporates seeking to stay ahead of compliance risks in Kenya’s evolving legal landscape.",
      date: 'Jun 16, 2024',
      datetime: '2020-03-16',
      category: { title: 'Audits', href: '#' },
      author: {
        name: 'Advocate Eva Nduta Munene',
        role: 'Founding Partner',
        href: '#',
        imageUrl:
          '/profile.png',
      },
    },
  ]
  
  const Blog = () => {
    const scrollRef = useRef<HTMLDivElement>(null)
    
    return (
      <div id="blog" className="h-screen py-24 bg-white bg sm:py-32 isolate">
        <div className="px-6 mx-auto max-w-7xl lg:px-8">
          <div  className="max-w-2xl mx-auto lg:mx-0">
            <h2 className="text-4xl font-semibold tracking-tight text-secondary text-pretty sm:text-5xl">From the blog</h2>
            <p className="mt-2 text-secondary text-lg/8">Trusted Legal Perspectives.</p>
          </div>
          {/* Mobile: horizontal scroll gallery */}
        <div className="relative block pt-10 mt-10 border-t border-gray-400 lg:hidden">
          <div
            ref={scrollRef}
            className="flex gap-6 px-8 py-2 overflow-x-auto snap-x snap-mandatory scroll-smooth"
            style={{ scrollPaddingLeft: 16, scrollPaddingRight: 16 }}
          >
            {posts.map((post) => (
              <article key={post.id} className="flex flex-col items-start justify-between max-w-xs min-w-[320px] flex-shrink-0 snap-center bg-white rounded-lg shadow p-4">
                <div className="flex items-center text-xs gap-x-4">
                  <time dateTime={post.datetime} className="text-gray-500">
                    {post.date}
                  </time>
                  <a
                    href={post.category.href}
                    className="relative z-10 rounded-full bg-gray-50 px-3 py-1.5 font-medium text-blue-600 hover:bg-gray-100"
                  >
                    {post.category.title}
                  </a>
                </div>
                <div className="relative group">
                  <h3 className="mt-3 font-semibold text-secondary text-lg/6 group-hover:text-greenroyal">
                    <a href={post.href}>
                      <span className="absolute inset-0 font-mea-culpa" />
                      {post.title}
                    </a>
                  </h3>
                  <p className="mt-5 text-gray-600 line-clamp-3 text-sm/6">{post.description}</p>
                </div>
                <div className="relative flex items-center mt-8 gap-x-4">
                  <img alt="" src={`https://github.com/gacheruevans/enmlegal/blob/main/dist/${post.author.imageUrl}?raw=true`} className="rounded-full object-fit size-10 bg-gray-50" />
                  <div className="text-sm/6">
                    <p className="font-semibold text-light">
                      <a href={post.author.href}>
                        <span className="absolute inset-0" />
                        {post.author.name}
                      </a>
                    </p>
                    <p className="text-neutral">{post.author.role}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
        {/* Desktop: grid */}
          <div className="hidden max-w-2xl grid-cols-1 pt-10 mx-auto mt-10 border-t border-gray-400 lg:grid gap-x-8 gap-y-16 sm:mt-16 sm:pt-16 lg:mx-0 lg:max-w-none lg:grid-cols-3">
            {posts.map((post) => (
              <article key={post.id} className="flex flex-col items-start justify-between max-w-xl">
                <div className="flex items-center text-xs gap-x-4">
                  <time dateTime={post.datetime} className="text-gray-500">
                    {post.date}
                  </time>
                  <a
                    href={post.category.href}
                    className="relative z-10 rounded-full bg-gray-50 px-3 py-1.5 font-medium text-blue-600 hover:bg-gray-100"
                  >
                    {post.category.title}
                  </a>
                </div>
                <div className="relative group">
                  <h3 className="mt-3 font-semibold text-secondary text-lg/6 group-hover:text-greenroyal">
                    <a href={post.href}>
                      <span className="absolute inset-0" />
                      {post.title}
                    </a>
                  </h3>
                  <p className="mt-5 text-gray-600 line-clamp-3 text-sm/6">{post.description}</p>
                </div>
                <div className="relative flex items-center mt-8 gap-x-4">
                  <img alt="" src={`https://github.com/gacheruevans/enmlegal/blob/main/dist/${post.author.imageUrl}?raw=true`} className="rounded-full size-10 bg-gray-50" />
                  <div className="text-sm/6">
                    <p className="font-semibold text-light">
                      <a href={post.author.href}>
                        <span className="absolute inset-0" />
                        {post.author.name}
                      </a>
                    </p>
                    <p className="text-neutral">{post.author.role}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    )
  }

export default Blog;
