import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  ShareIcon,
  LinkIcon,
  CheckIcon,
  ArrowRightIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';
import {
  FaWhatsapp,
  FaLinkedinIn,
  FaXTwitter,
  FaFacebookF,
  FaHeart,
  FaRegHeart,
} from 'react-icons/fa6';
import api from '../../lib/api';

type BlogPostSummary = {
  id: string;
  title: string;
  href: string;
  description: string;
  date: string;
  datetime: string;
  category: { title: string; href: string };
  author: { name: string; role: string; href: string; imageUrl?: string | null };
  content?: string;
  imageUrl?: string | null;
  createdAt?: string;
  status?: string;
  likes?: number;
};

const examplePosts: BlogPostSummary[] = [
  {
    id: 'sample-1',
    title: 'Probate Administration: Navigating the Legal Landscape',
    href: '/blog/sample-1',
    description:
      "Navigating the probate process can be emotionally and legally complex, especially after the loss of a loved one. In this article, we break down the key stages of probate administration in Kenya, including obtaining a grant of probate or letters of administration, handling estate assets, settling debts, and distributing inheritance.",
    date: 'Mar 16, 2025',
    datetime: '2025-03-16',
    likes: 14,
    category: { title: 'Administration', href: '#' },
    author: {
      name: 'Advocate Eva Nduta Munene',
      role: 'Founding Partner',
      href: '#',
      imageUrl: '/profile.png',
    },
    content: 'Probate administration requires careful planning, accurate documentation, and sound legal guidance.',
  },
  {
    id: 'sample-2',
    title: 'Real Estate & Conveyancing: A Comprehensive Guide',
    href: '/blog/sample-2',
    description:
      "Buying, selling, or transferring property in Kenya involves intricate legal steps that must be followed to protect your rights. This article demystifies the conveyancing process—covering land searches, sale agreements, title transfers, and registration procedures.",
    date: 'Apr 16, 2025',
    datetime: '2025-04-16',
    likes: 28,
    category: { title: 'Realestate', href: '#' },
    author: {
      name: 'Advocate Eva Nduta Munene',
      role: 'Founding Partner',
      href: '#',
      imageUrl: '/profile.png',
    },
    content: 'Conveyancing in Kenya involves due diligence, agreements, transfer documentation, and registration safeguards.',
  },
  {
    id: 'sample-3',
    title: 'Banking Securities: An Introduction to Banking Securities & Collateral Law in Kenya',
    href: '/blog/sample-3',
    description:
      "Securing loans with collateral involves detailed legal procedures that protect both lenders and borrowers. This article explores the legal framework around charges, mortgages, debentures, and asset securitization in Kenya.",
    date: 'Jun 16, 2025',
    datetime: '2025-06-16',
    likes: 21,
    category: { title: 'Banking', href: '#' },
    author: {
      name: 'Advocate Eva Nduta Munene',
      role: 'Founding Partner',
      href: '#',
      imageUrl: '/profile.png',
    },
    content: 'Collateral and banking securities should be structured and documented carefully.',
  },
  {
    id: 'sample-4',
    title: 'Dispute Resolution: Effective Strategies for Resolving Legal Conflicts',
    href: '/blog/sample-4',
    description:
      "Disputes are inevitable—but how you resolve them makes all the difference. This article compares mediation, arbitration, and litigation in Kenya, offering guidance on the most efficient and cost-effective approach for different legal scenarios.",
    date: 'Apr 16, 2024',
    datetime: '2024-04-16',
    likes: 33,
    category: { title: 'Social', href: '#' },
    author: {
      name: 'Advocate Eva Nduta Munene',
      role: 'Founding Partner',
      href: '#',
      imageUrl: '/profile.png',
    },
    content: 'Effective dispute resolution strategies often balance legal rights, business goals, and long-term relationships.',
  },
  {
    id: 'sample-5',
    title: 'Startups & SMEs: Legal Essentials for Entrepreneurs',
    href: '/blog/sample-5',
    description:
      "From registration to funding to IP protection, startups face unique legal challenges. This article outlines the core legal steps for launching and scaling a business in Kenya—covering company formation, contracts, compliance, and investor readiness.",
    date: 'May 16, 2024',
    datetime: '2024-05-16',
    likes: 47,
    category: { title: 'Startups', href: '#' },
    author: {
      name: 'Advocate Eva Nduta Munene',
      role: 'Founding Partner',
      href: '#',
      imageUrl: '/profile.png',
    },
    content: 'Startups need a strong legal foundation from incorporation through funding agreements.',
  },
  {
    id: 'sample-6',
    title: 'Legal Audit & Compliance: Ensuring Your Business Meets Regulatory Standards',
    href: '/blog/sample-6',
    description:
      "A legal audit isn’t just about checking boxes—it’s about protecting your organization. This article explains how legal audits identify regulatory gaps, strengthen internal controls, and prevent costly penalties in Kenya’s evolving landscape.",
    date: 'Jun 16, 2024',
    datetime: '2024-06-16',
    likes: 36,
    category: { title: 'Audits', href: '#' },
    author: {
      name: 'Advocate Eva Nduta Munene',
      role: 'Founding Partner',
      href: '#',
      imageUrl: '/profile.png',
    },
    content: 'Legal compliance reviews help businesses identify gaps, improve controls, and reduce exposure.',
  },
];

interface CategoryItem {
  id: string;
  title: string;
  slug: string;
}

const Blog = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const [posts, setPosts] = useState<BlogPostSummary[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  // Quick share popover tracking
  const [activeShareId, setActiveShareId] = useState<string | null>(null);
  const [copiedShareId, setCopiedShareId] = useState<string | null>(null);

  const pageSize = 6;

  const mapPostSummary = (post: any): BlogPostSummary => ({
    id: post.id,
    title: post.title,
    href: `/blog/${post.id}`,
    description: post.description,
    date: post.date || new Date(post.createdAt).toLocaleDateString(),
    datetime: post.datetime || post.createdAt,
    likes: typeof post.likes === "number" ? post.likes : 0,
    category: {
      title: post.category?.title || "Uncategorized",
      href: "#",
    },
    author: {
      name: post.author?.name || "Advocate Eva Nduta Munene",
      role: post.author?.role || "Founding Partner",
      href: "#",
      imageUrl: post.author?.imageUrl || "/profile.png",
    },
    content: post.content,
    imageUrl: post.imageUrl,
    createdAt: post.createdAt,
    status: post.status,
  });

  // Load categories once
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const { data } = await api.get('/categories');
        setCategories(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to load blog categories", err);
      }
    };
    fetchCats();
  }, []);

  // Close share popovers on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-share-menu]')) {
        setActiveShareId(null);
      }
    };
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);

  // Fetch initial posts on category change or mount
  useEffect(() => {
    let isMounted = true;

    const loadInitialPosts = async () => {
      setIsLoading(true);
      setCurrentPage(1);

      try {
        const params: any = {
          status: 'PUBLISHED',
          page: 1,
          limit: pageSize,
        };

        if (selectedCategory !== 'ALL') {
          params.categoryId = selectedCategory;
        }

        const { data } = await api.get('/posts', { params });

        if (!isMounted) return;

        const dbPosts = Array.isArray(data?.nodes)
          ? data.nodes.map(mapPostSummary)
          : [];

        if (dbPosts.length > 0) {
          setPosts(dbPosts);
        } else if (selectedCategory === 'ALL') {
          setPosts(examplePosts);
        } else {
          setPosts([]);
        }

        const totalP = data?.totalPages || 1;
        setTotalPages(totalP);
        setHasMore(1 < totalP);
      } catch {
        if (isMounted) {
          setPosts(selectedCategory === 'ALL' ? examplePosts : []);
          setTotalPages(1);
          setHasMore(false);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadInitialPosts();

    return () => {
      isMounted = false;
    };
  }, [selectedCategory]);

  // Load next page of posts for infinite scroll
  const loadNextPage = useCallback(async () => {
    if (isLoading || isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);
    const nextPage = currentPage + 1;

    try {
      const params: any = {
        status: 'PUBLISHED',
        page: nextPage,
        limit: pageSize,
      };

      if (selectedCategory !== 'ALL') {
        params.categoryId = selectedCategory;
      }

      const { data } = await api.get('/posts', { params });
      const incomingPosts = Array.isArray(data?.nodes)
        ? data.nodes.map(mapPostSummary)
        : [];

      setPosts((prev) => {
        const seen = new Set(prev.map((p) => p.id));
        const filtered = incomingPosts.filter((p: any) => !seen.has(p.id));
        return [...prev, ...filtered];
      });

      setCurrentPage(nextPage);
      const totalP = data?.totalPages || totalPages;
      setTotalPages(totalP);
      setHasMore(nextPage < totalP);
    } catch (err) {
      console.error("Failed to load more blog posts", err);
    } finally {
      setIsLoadingMore(false);
    }
  }, [currentPage, hasMore, isLoading, isLoadingMore, selectedCategory, totalPages]);

  // Infinite Scroll IntersectionObserver Sentinel
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && hasMore && !isLoading && !isLoadingMore) {
          loadNextPage();
        }
      },
      {
        root: null,
        rootMargin: '300px',
        threshold: 0.1,
      }
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, [hasMore, isLoading, isLoadingMore, loadNextPage]);

  // Like handler on card
  const handleLikePost = async (e: React.MouseEvent, post: BlogPostSummary) => {
    e.preventDefault();
    e.stopPropagation();

    const isLiked = localStorage.getItem(`liked_post_${post.id}`) === 'true';
    const nextLiked = !isLiked;

    if (nextLiked) {
      localStorage.setItem(`liked_post_${post.id}`, 'true');
    } else {
      localStorage.removeItem(`liked_post_${post.id}`);
    }

    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === post.id) {
          const cur = p.likes ?? 0;
          return {
            ...p,
            likes: nextLiked ? cur + 1 : Math.max(0, cur - 1),
          };
        }
        return p;
      })
    );

    if (!post.id.startsWith('sample-')) {
      try {
        const res = await api.post(`/posts/${post.id}/like`, {
          action: nextLiked ? 'like' : 'unlike',
        });
        if (typeof res.data?.likes === 'number') {
          setPosts((prev) =>
            prev.map((p) => (p.id === post.id ? { ...p, likes: res.data.likes } : p))
          );
        }
      } catch (err) {
        console.error("Failed to like post", err);
      }
    }
  };

  // Quick Share handlers
  const handleShareClick = (e: React.MouseEvent, postId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveShareId((cur) => (cur === postId ? null : postId));
  };

  const getFullPostUrl = (postHref: string) => {
    if (typeof window === "undefined") return postHref;
    return `${window.location.origin}${postHref}`;
  };

  const handleShareToPlatform = (
    e: React.MouseEvent,
    platform: "whatsapp" | "linkedin" | "twitter" | "facebook" | "copy",
    post: BlogPostSummary
  ) => {
    e.preventDefault();
    e.stopPropagation();

    const url = getFullPostUrl(post.href);
    const title = post.title;

    switch (platform) {
      case "whatsapp":
        window.open(
          `https://api.whatsapp.com/send?text=${encodeURIComponent(`${title}\n\n${url}`)}`,
          "_blank",
          "noopener,noreferrer"
        );
        break;
      case "linkedin":
        window.open(
          `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
          "_blank",
          "noopener,noreferrer"
        );
        break;
      case "twitter":
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
          "_blank",
          "noopener,noreferrer"
        );
        break;
      case "facebook":
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
          "_blank",
          "noopener,noreferrer"
        );
        break;
      case "copy":
        navigator.clipboard.writeText(url).then(() => {
          setCopiedShareId(post.id);
          setTimeout(() => setCopiedShareId(null), 2000);
        });
        break;
    }
  };

  // Horizontal scroll helpers for mobile slider
  const scrollMobile = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const offset = direction === 'left' ? -320 : 320;
      scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  return (
    <div id="blog" className="z-10 py-24 bg-white sm:py-32">
      <div className="px-6 mx-auto max-w-7xl lg:px-8">
        {/* Section Header */}
        <div className="max-w-2xl mx-auto lg:mx-0">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-royal text-xs font-bold tracking-wider uppercase mb-3">
            <span>Insights & Legal Analysis</span>
          </div>
          <h2 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl font-display">
            From the Blog
          </h2>
          <p className="mt-3 text-gray-600 text-lg">
            Authoritative legal perspectives, regulatory updates, and commercial guides for Kenya and East Africa.
          </p>
        </div>

        {/* Category Grouping Tabs */}
        {categories.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-8 scrollbar-none">
            <button
              type="button"
              onClick={() => setSelectedCategory("ALL")}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                selectedCategory === "ALL"
                  ? "bg-royal text-white shadow-md shadow-royal/20"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              All Topics
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                  selectedCategory === cat.id
                    ? "bg-royal text-white shadow-md shadow-royal/20"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {cat.title}
              </button>
            ))}
          </div>
        )}

        {/* Initial Loading Skeletons */}
        {isLoading && posts.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pt-8 mt-6 border-t border-gray-200">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse bg-white rounded-2xl border border-gray-100 p-5 shadow-xs space-y-4">
                <div className="w-full h-48 bg-gray-200 rounded-xl" />
                <div className="w-24 h-5 bg-gray-200 rounded-full" />
                <div className="w-3/4 h-6 bg-gray-200 rounded" />
                <div className="w-full h-12 bg-gray-100 rounded" />
                <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                  <div className="w-9 h-9 rounded-full bg-gray-200" />
                  <div className="space-y-1.5 flex-1">
                    <div className="w-24 h-3.5 bg-gray-200 rounded" />
                    <div className="w-16 h-3 bg-gray-100 rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {/* Mobile View Slider */}
        <div className="relative block pt-8 mt-6 border-t border-gray-200 lg:hidden">
          {posts.length === 0 && !isLoading ? (
            <div className="py-12 text-center text-sm text-gray-500">
              No articles published in this category yet.
            </div>
          ) : (
            <div className="relative">
              {/* Slider Controls */}
              {posts.length > 1 && (
                <div className="flex items-center justify-end gap-2 mb-3">
                  <button
                    onClick={() => scrollMobile('left')}
                    aria-label="Scroll left"
                    className="p-1.5 rounded-full border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 shadow-xs cursor-pointer"
                  >
                    <ChevronLeftIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => scrollMobile('right')}
                    aria-label="Scroll right"
                    className="p-1.5 rounded-full border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 shadow-xs cursor-pointer"
                  >
                    <ChevronRightIcon className="w-4 h-4" />
                  </button>
                </div>
              )}

              <div
                ref={scrollRef}
                className="flex gap-6 px-1 py-2 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-4"
              >
                {posts.map((post) => {
                  const isPostLiked =
                    typeof localStorage !== "undefined" &&
                    localStorage.getItem(`liked_post_${post.id}`) === "true";

                  return (
                    <article
                      key={post.id}
                      className="group relative flex flex-col items-start justify-between max-w-xs min-w-[300px] flex-shrink-0 snap-center bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:border-royal/30 transition-all"
                    >
                      {post.imageUrl && (
                        <div className="w-full mb-3 overflow-hidden rounded-xl h-44 bg-gray-100">
                          <img
                            src={post.imageUrl}
                            alt={post.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      )}

                      <div className="w-full flex items-center justify-between text-xs mb-2">
                        <span className="relative z-10 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-royal">
                          {post.category.title}
                        </span>
                        <time dateTime={post.datetime} className="text-gray-400">
                          {post.date}
                        </time>
                      </div>

                      <div className="relative group mt-1 flex-1">
                        <h3 className="font-bold text-gray-900 text-base group-hover:text-royal transition leading-snug line-clamp-2">
                          <a href={post.href}>
                            <span className="absolute inset-0" />
                            {post.title}
                          </a>
                        </h3>
                        <p className="mt-2 text-gray-600 line-clamp-3 text-xs leading-relaxed">
                          {post.description}
                        </p>
                      </div>

                      {/* Card Footer: Author + Like & Share */}
                      <div className="relative flex items-center justify-between mt-5 pt-3.5 border-t border-gray-100 w-full z-10">
                        <div className="flex items-center gap-2.5">
                          <img
                            alt=""
                            src={post.author.imageUrl ? post.author.imageUrl : '/profile.png'}
                            className="rounded-full size-8 bg-gray-50 object-cover border border-gray-100"
                          />
                          <div className="text-xs">
                            <p className="font-semibold text-gray-900 leading-tight">
                              {post.author.name}
                            </p>
                            <p className="text-[11px] text-gray-400">{post.author.role}</p>
                          </div>
                        </div>

                        {/* Interactive Like & Share Buttons */}
                        <div className="flex items-center gap-1.5" data-share-menu>
                          <button
                            type="button"
                            onClick={(e) => handleLikePost(e, post)}
                            title="Like article"
                            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold transition cursor-pointer border ${
                              isPostLiked
                                ? "bg-rose-50 text-rose-700 border-rose-200"
                                : "bg-gray-50 text-gray-600 hover:bg-rose-50 hover:text-rose-600 border-gray-200"
                            }`}
                          >
                            {isPostLiked ? (
                              <FaHeart className="w-3 h-3 text-rose-600" />
                            ) : (
                              <FaRegHeart className="w-3 h-3 text-gray-400" />
                            )}
                            <span>{post.likes ?? 0}</span>
                          </button>

                          <button
                            type="button"
                            onClick={(e) => handleShareClick(e, post.id)}
                            title="Share article"
                            className="p-1.5 rounded-full text-gray-500 hover:text-royal hover:bg-gray-100 border border-gray-200 transition cursor-pointer"
                          >
                            <ShareIcon className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Share Popover Menu */}
                      {activeShareId === post.id && (
                        <div
                          data-share-menu
                          className="absolute right-4 bottom-14 z-30 bg-white border border-gray-200 shadow-xl rounded-2xl p-2 flex items-center gap-1 animate-fade-in"
                        >
                          <button
                            type="button"
                            onClick={(e) => handleShareToPlatform(e, "whatsapp", post)}
                            title="WhatsApp"
                            className="p-2 text-gray-600 hover:text-[#25D366] hover:bg-emerald-50 rounded-xl transition"
                          >
                            <FaWhatsapp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleShareToPlatform(e, "linkedin", post)}
                            title="LinkedIn"
                            className="p-2 text-gray-600 hover:text-[#0A66C2] hover:bg-blue-50 rounded-xl transition"
                          >
                            <FaLinkedinIn className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleShareToPlatform(e, "twitter", post)}
                            title="X (Twitter)"
                            className="p-2 text-gray-600 hover:text-black hover:bg-gray-100 rounded-xl transition"
                          >
                            <FaXTwitter className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleShareToPlatform(e, "copy", post)}
                            title="Copy link"
                            className="p-2 text-gray-600 hover:text-royal hover:bg-blue-50 rounded-xl transition"
                          >
                            {copiedShareId === post.id ? (
                              <CheckIcon className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <LinkIcon className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Desktop View Grid */}
        <div className="hidden max-w-2xl grid-cols-1 pt-8 mx-auto mt-6 border-t border-gray-200 lg:grid gap-x-8 gap-y-12 sm:pt-10 lg:mx-0 lg:max-w-none lg:grid-cols-3">
          {posts.length === 0 && !isLoading ? (
            <div className="col-span-3 py-16 text-center text-sm text-gray-500">
              No articles published in this category yet. Check back soon or select another category above.
            </div>
          ) : (
            posts.map((post) => {
              const isPostLiked =
                typeof localStorage !== "undefined" &&
                localStorage.getItem(`liked_post_${post.id}`) === "true";

              return (
                <article
                  key={post.id}
                  className="group relative flex flex-col items-start justify-between bg-white rounded-2xl border border-gray-100 p-5 shadow-xs hover:shadow-xl hover:border-royal/30 transition-all duration-300"
                >
                  {post.imageUrl && (
                    <div className="w-full mb-4 overflow-hidden rounded-xl h-48 bg-gray-100">
                      <img
                        src={post.imageUrl}
                        alt={post.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                  )}

                  <div className="w-full flex items-center justify-between text-xs mb-3">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-royal border border-blue-100">
                      {post.category.title}
                    </span>
                    <time dateTime={post.datetime} className="text-gray-400 text-xs">
                      {post.date}
                    </time>
                  </div>

                  <div className="relative group w-full flex-1">
                    <h3 className="font-bold text-gray-900 text-lg group-hover:text-royal transition leading-snug line-clamp-2">
                      <a href={post.href}>
                        <span className="absolute inset-0" />
                        {post.title}
                      </a>
                    </h3>
                    <p className="mt-2.5 text-gray-600 line-clamp-3 text-sm leading-relaxed">
                      {post.description}
                    </p>
                  </div>

                  {/* Card Footer: Author details + Like & Social Share */}
                  <div className="relative flex items-center justify-between mt-6 gap-x-3 pt-4 border-t border-gray-100 w-full z-10">
                    <div className="flex items-center gap-3">
                      <img
                        alt=""
                        src={post.author.imageUrl ? post.author.imageUrl : '/profile.png'}
                        className="rounded-full size-9 bg-gray-50 object-cover border border-gray-100"
                      />
                      <div className="text-xs">
                        <p className="font-semibold text-gray-900 leading-tight">{post.author.name}</p>
                        <p className="text-gray-400 text-[11px]">{post.author.role}</p>
                      </div>
                    </div>

                    {/* Action buttons (Like & Share) */}
                    <div className="flex items-center gap-1.5" data-share-menu>
                      {/* Heart Like Button */}
                      <button
                        type="button"
                        onClick={(e) => handleLikePost(e, post)}
                        title={isPostLiked ? "Unlike article" : "Like article"}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition cursor-pointer border ${
                          isPostLiked
                            ? "bg-rose-50 text-rose-700 border-rose-200"
                            : "bg-gray-50 text-gray-600 hover:bg-rose-50 hover:text-rose-600 border-gray-200"
                        }`}
                      >
                        {isPostLiked ? (
                          <FaHeart className="w-3.5 h-3.5 text-rose-600" />
                        ) : (
                          <FaRegHeart className="w-3.5 h-3.5 text-gray-400 group-hover:text-rose-500" />
                        )}
                        <span>{post.likes ?? 0}</span>
                      </button>

                      {/* Share Popover Trigger */}
                      <button
                        type="button"
                        onClick={(e) => handleShareClick(e, post.id)}
                        title="Share article"
                        className="p-1.5 text-gray-500 hover:text-royal hover:bg-gray-100 rounded-full border border-gray-200 transition cursor-pointer"
                      >
                        <ShareIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Share Popover Menu */}
                  {activeShareId === post.id && (
                    <div
                      data-share-menu
                      className="absolute right-5 bottom-16 z-30 bg-white border border-gray-200 shadow-xl rounded-2xl p-2 flex items-center gap-1 animate-fade-in"
                    >
                      <button
                        type="button"
                        onClick={(e) => handleShareToPlatform(e, "whatsapp", post)}
                        title="Share on WhatsApp"
                        className="p-2 text-gray-600 hover:text-[#25D366] hover:bg-emerald-50 rounded-xl transition cursor-pointer"
                      >
                        <FaWhatsapp className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => handleShareToPlatform(e, "linkedin", post)}
                        title="Share on LinkedIn"
                        className="p-2 text-gray-600 hover:text-[#0A66C2] hover:bg-blue-50 rounded-xl transition cursor-pointer"
                      >
                        <FaLinkedinIn className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => handleShareToPlatform(e, "twitter", post)}
                        title="Share on X"
                        className="p-2 text-gray-600 hover:text-black hover:bg-gray-100 rounded-xl transition cursor-pointer"
                      >
                        <FaXTwitter className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => handleShareToPlatform(e, "facebook", post)}
                        title="Share on Facebook"
                        className="p-2 text-gray-600 hover:text-[#1877F2] hover:bg-blue-50 rounded-xl transition cursor-pointer"
                      >
                        <FaFacebookF className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => handleShareToPlatform(e, "copy", post)}
                        title="Copy article link"
                        className="p-2 text-gray-600 hover:text-royal hover:bg-blue-50 rounded-xl transition cursor-pointer"
                      >
                        {copiedShareId === post.id ? (
                          <CheckIcon className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <LinkIcon className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  )}
                </article>
              );
            })
          )}
        </div>

        {/* Infinite Scroll Sentinel & Bottom Loading Indicator */}
        <div ref={sentinelRef} className="pt-10 flex flex-col items-center justify-center">
          {isLoadingMore && (
            <div className="flex items-center gap-3 px-5 py-2.5 rounded-full bg-blue-50/80 border border-blue-100 text-royal text-sm font-semibold shadow-xs animate-pulse">
              <div className="w-4 h-4 border-2 border-royal border-t-transparent rounded-full animate-spin" />
              <span>Loading more articles...</span>
            </div>
          )}

          {!hasMore && posts.length > pageSize && (
            <p className="text-xs text-gray-400 font-medium">
              You've viewed all available articles in this category.
            </p>
          )}

          {/* Graceful manual load more button fallback if observer doesn't fire */}
          {hasMore && !isLoadingMore && (
            <button
              type="button"
              onClick={loadNextPage}
              className="mt-4 px-6 py-2.5 rounded-full text-xs font-semibold text-royal bg-blue-50 hover:bg-royal hover:text-white transition-all border border-blue-200 shadow-xs cursor-pointer inline-flex items-center gap-2"
            >
              <span>Load More Posts</span>
              <ArrowRightIcon className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Blog;
