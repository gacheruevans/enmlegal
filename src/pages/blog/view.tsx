import { ChevronRightIcon, ShareIcon, LinkIcon, CheckIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import Markdown from "react-markdown";
import {
  FaWhatsapp,
  FaLinkedinIn,
  FaXTwitter,
  FaFacebookF,
  FaHeart,
  FaRegHeart,
} from "react-icons/fa6";
import api from "../../lib/api";
import { usePageSEO } from "../../hooks/usePageSEO";

type BlogPostDetail = {
  id: string;
  title: string;
  description: string;
  content: string;
  date: string;
  datetime: string;
  imageUrl?: string | null;
  status?: string;
  likes?: number;
  views?: number;
  category?: { title?: string } | null;
  author?: { name?: string; role?: string; imageUrl?: string | null } | null;
};

const normalizeImageUrl = (url?: string | null, fallback = "/profile.png"): string => {
  if (!url || typeof url !== "string" || !url.trim()) return fallback;
  const trimmed = url.trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://") || trimmed.startsWith("data:")) {
    return trimmed;
  }
  return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
};

export const ViewPost = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState<BlogPostDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dynamic SEO Synchronization
  usePageSEO({
    title: post ? `${post.title} | ENM Legal Advocates` : "Legal Insight | ENM Legal",
    description: post?.description || "Read legal commentary and insights from ENM Legal Advocates.",
    canonicalPath: id ? `/blog/${id}` : "/blog",
  });

  // Likes state
  const [likesCount, setLikesCount] = useState<number>(0);
  const [hasLiked, setHasLiked] = useState<boolean>(false);
  const [isLiking, setIsLiking] = useState<boolean>(false);

  // Social share feedback
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    const loadPost = async () => {
      if (!id) {
        setError("The requested post could not be found.");
        setLoading(false);
        return;
      }

      try {
        const { data } = await api.get(`/posts/${id}`);
        setPost(data);
        setLikesCount(data.likes || 0);
        setHasLiked(localStorage.getItem(`liked_post_${data.id}`) === "true");
      } catch {
        setError("The requested article could not be found or is not available.");
      } finally {
        setLoading(false);
      }
    };

    loadPost();
  }, [id]);

  // Record user view count automatically (visible to admins only in dashboard)
  useEffect(() => {
    if (post && post.id) {
      const sessionKey = `viewed_post_${post.id}`;
      if (!sessionStorage.getItem(sessionKey)) {
        sessionStorage.setItem(sessionKey, "true");
        api.post(`/posts/${post.id}/view`).catch((err) => {
          console.warn("Failed to record article view", err);
        });
      }
    }
  }, [post?.id]);

  const handleLikeToggle = async () => {
    if (!post || isLiking) return;

    const nextLiked = !hasLiked;
    const nextCount = nextLiked ? likesCount + 1 : Math.max(0, likesCount - 1);

    setHasLiked(nextLiked);
    setLikesCount(nextCount);

    if (nextLiked) {
      localStorage.setItem(`liked_post_${post.id}`, "true");
    } else {
      localStorage.removeItem(`liked_post_${post.id}`);
    }

    setIsLiking(true);
    try {
      const res = await api.post(`/posts/${post.id}/like`, {
        action: nextLiked ? "like" : "unlike",
      });
      if (typeof res.data?.likes === "number") {
        setLikesCount(res.data.likes);
      }
    } catch (err) {
      console.error("Failed to sync like state with server", err);
    } finally {
      setIsLiking(false);
    }
  };

  const currentUrl = typeof window !== "undefined" ? window.location.href : "";

  const handleShare = (platform: "whatsapp" | "linkedin" | "twitter" | "facebook" | "native") => {
    if (!post) return;
    const shareTitle = post.title;
    const shareText = post.description || post.title;

    switch (platform) {
      case "whatsapp": {
        const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(
          `${shareTitle}\n\n${currentUrl}`
        )}`;
        window.open(url, "_blank", "noopener,noreferrer");
        break;
      }
      case "linkedin": {
        const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
          currentUrl
        )}`;
        window.open(url, "_blank", "noopener,noreferrer");
        break;
      }
      case "twitter": {
        const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
          shareTitle
        )}&url=${encodeURIComponent(currentUrl)}`;
        window.open(url, "_blank", "noopener,noreferrer");
        break;
      }
      case "facebook": {
        const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
          currentUrl
        )}`;
        window.open(url, "_blank", "noopener,noreferrer");
        break;
      }
      case "native": {
        if (navigator.share) {
          navigator
            .share({
              title: shareTitle,
              text: shareText,
              url: currentUrl,
            })
            .catch(() => {});
        } else {
          handleCopyLink();
        }
        break;
      }
    }
  };

  const handleCopyLink = () => {
    if (!currentUrl) return;
    navigator.clipboard.writeText(currentUrl).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 py-24 bg-white">
        <div className="w-10 h-10 border-3 border-royal border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-medium text-gray-500">Loading legal insight...</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen px-6 py-24 bg-white">
        <div className="max-w-3xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 mb-10 font-bold transition-colors text-royal hover:text-royal/80 cursor-pointer"
          >
            <ChevronRightIcon className="h-5 rotate-180" />
            Back to articles
          </button>
          <div className="p-8 text-sm text-gray-600 border border-gray-200 rounded-2xl bg-gray-50">
            {error || "The requested article could not be found."}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-28 bg-white selection:bg-royal/10 selection:text-royal">
      <div className="max-w-4xl px-6 mx-auto">
        {/* Navigation & Breadcrumb */}
        <div className="flex items-center justify-between gap-4 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-sm font-semibold text-royal hover:text-royal/80 transition-colors group cursor-pointer"
          >
            <ChevronRightIcon className="h-4 w-4 rotate-180 transition-transform group-hover:-translate-x-1" />
            Back to all articles
          </button>

          <span className="px-3 py-1 text-xs font-bold tracking-wider uppercase rounded-full bg-blue-50 text-royal border border-blue-100">
            {post.category?.title || "Legal Insight"}
          </span>
        </div>

        {/* Article Header */}
        <header className="mb-10">
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl md:text-5xl leading-[1.18] mb-6">
            {post.title}
          </h1>

          {/* Author Metadata & Actions Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 py-4 border-y border-gray-100 text-sm">
            <div className="flex items-center gap-3">
              <img
                src={normalizeImageUrl(post.author?.imageUrl, "/profile.png")}
                alt={post.author?.name || "Eva Nduta Munene"}
                className="w-11 h-11 rounded-full object-cover border border-gray-200"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = "/profile.png";
                }}
              />
              <div>
                <p className="font-bold text-gray-900 leading-tight">
                  {post.author?.name || "Advocate Eva Nduta Munene"}
                </p>
                <p className="text-xs text-gray-500">
                  {post.date} • {post.author?.role || "Founding Partner"}
                </p>
              </div>
            </div>

            {/* Like Counter & Quick Actions */}
            <div className="flex items-center gap-2">
              {/* Like Button */}
              <button
                type="button"
                onClick={handleLikeToggle}
                disabled={isLiking}
                title={hasLiked ? "Unlike article" : "Like this article"}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all transform active:scale-95 cursor-pointer border ${
                  hasLiked
                    ? "bg-rose-50 text-rose-700 border-rose-200 shadow-xs"
                    : "bg-gray-50 text-gray-700 hover:bg-rose-50 hover:text-rose-600 border-gray-200"
                }`}
              >
                {hasLiked ? (
                  <FaHeart className="w-3.5 h-3.5 text-rose-600 fill-current animate-bounce" />
                ) : (
                  <FaRegHeart className="w-3.5 h-3.5 text-gray-500 hover:text-rose-500" />
                )}
                <span>{likesCount.toLocaleString()} {likesCount === 1 ? "Like" : "Likes"}</span>
              </button>

              {/* Native share button if supported */}
              {typeof navigator !== "undefined" && typeof navigator.share === "function" && (
                <button
                  type="button"
                  onClick={() => handleShare("native")}
                  title="Share article"
                  className="p-2 text-gray-600 hover:text-royal hover:bg-gray-100 rounded-full border border-gray-200 transition cursor-pointer"
                >
                  <ShareIcon className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Featured Cover Image */}
        {post.imageUrl && (
          <div className="mb-10 overflow-hidden rounded-3xl border border-gray-100 shadow-lg bg-gray-50">
            <img
              src={normalizeImageUrl(post.imageUrl, "")}
              alt={post.title}
              className="object-cover w-full max-h-[500px]"
              referrerPolicy="no-referrer"
            />
          </div>
        )}

        {/* Article Content */}
        <article className="prose prose-lg prose-slate max-w-none text-gray-800 leading-relaxed font-normal">
          <div className="markdown-body leading-relaxed">
            <Markdown
              components={{
                a: ({ href, children, ...props }) => {
                  const isExternal = !!href && /^https?:\/\//i.test(href);
                  return (
                    <a
                      href={href}
                      {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                      className="text-royal font-semibold underline underline-offset-2 hover:text-royal/80 transition-colors"
                      {...props}
                    >
                      {children}
                    </a>
                  );
                },
              }}
            >
              {post.content}
            </Markdown>
          </div>
        </article>

        {/* Article Summary Box */}
        {post.description && (
          <div className="p-5 mt-10 rounded-2xl bg-blue-50/60 border border-blue-100/80 text-sm text-gray-700">
            <h4 className="font-bold text-royal uppercase tracking-wider text-xs mb-1.5">
              Key Executive Summary
            </h4>
            <p className="leading-relaxed">{post.description}</p>
          </div>
        )}

        {/* Engagement & Social Share Section */}
        <section className="mt-14 pt-8 border-t border-gray-200">
          <div className="bg-gradient-to-br from-gray-50 to-blue-50/30 rounded-3xl p-6 sm:p-8 border border-gray-200/80 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                Found this insight helpful?
              </h3>
              <p className="text-sm text-gray-600 mt-1 max-w-md">
                Show your support by liking this article or sharing it with colleagues, partners, and clients.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Like Button in CTA */}
              <button
                type="button"
                onClick={handleLikeToggle}
                className={`inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full text-sm font-semibold transition-all transform active:scale-95 cursor-pointer border ${
                  hasLiked
                    ? "bg-rose-50 text-rose-700 border-rose-300 shadow-sm"
                    : "bg-white text-gray-800 hover:bg-rose-50 hover:text-rose-600 border-gray-300 shadow-xs"
                }`}
              >
                {hasLiked ? (
                  <FaHeart className="w-4 h-4 text-rose-600" />
                ) : (
                  <FaRegHeart className="w-4 h-4 text-gray-500" />
                )}
                <span>{hasLiked ? "Liked" : "Like Article"} ({likesCount})</span>
              </button>

              {/* Social Share Icon Buttons */}
              <div className="flex items-center gap-1.5 bg-white p-1.5 rounded-full border border-gray-300 shadow-xs">
                {/* WhatsApp */}
                <button
                  type="button"
                  onClick={() => handleShare("whatsapp")}
                  title="Share on WhatsApp"
                  className="p-2.5 text-gray-600 hover:text-[#25D366] hover:bg-emerald-50 rounded-full transition cursor-pointer"
                >
                  <FaWhatsapp className="w-4 h-4" />
                </button>

                {/* LinkedIn */}
                <button
                  type="button"
                  onClick={() => handleShare("linkedin")}
                  title="Share on LinkedIn"
                  className="p-2.5 text-gray-600 hover:text-[#0A66C2] hover:bg-blue-50 rounded-full transition cursor-pointer"
                >
                  <FaLinkedinIn className="w-4 h-4" />
                </button>

                {/* X (Twitter) */}
                <button
                  type="button"
                  onClick={() => handleShare("twitter")}
                  title="Share on X"
                  className="p-2.5 text-gray-600 hover:text-black hover:bg-gray-100 rounded-full transition cursor-pointer"
                >
                  <FaXTwitter className="w-4 h-4" />
                </button>

                {/* Facebook */}
                <button
                  type="button"
                  onClick={() => handleShare("facebook")}
                  title="Share on Facebook"
                  className="p-2.5 text-gray-600 hover:text-[#1877F2] hover:bg-blue-50 rounded-full transition cursor-pointer"
                >
                  <FaFacebookF className="w-3.5 h-3.5" />
                </button>

                {/* Copy Link */}
                <button
                  type="button"
                  onClick={handleCopyLink}
                  title="Copy article link"
                  className="p-2.5 text-gray-600 hover:text-royal hover:bg-blue-50 rounded-full transition relative cursor-pointer"
                >
                  {copiedLink ? (
                    <CheckIcon className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <LinkIcon className="w-4 h-4" />
                  )}
                </button>
              </div>

              {/* Copied toast badge */}
              {copiedLink && (
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full animate-fade-in">
                  Link copied!
                </span>
              )}
            </div>
          </div>
        </section>
      </div>

      {/* Floating Bottom Social & Like Bar for mobile & smooth reading */}
      <aside
        aria-label="Article engagement toolbar"
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 bg-white/95 backdrop-blur-md border border-gray-200/90 shadow-xl rounded-full px-4 py-2 flex items-center gap-3 transition-all"
      >
        <button
          type="button"
          onClick={handleLikeToggle}
          title={hasLiked ? "Unlike article" : "Like this article"}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${
            hasLiked
              ? "bg-rose-100 text-rose-700"
              : "text-gray-700 hover:bg-rose-50 hover:text-rose-600"
          }`}
        >
          {hasLiked ? (
            <FaHeart className="w-3.5 h-3.5 text-rose-600" />
          ) : (
            <FaRegHeart className="w-3.5 h-3.5" />
          )}
          <span>{likesCount.toLocaleString()}</span>
        </button>

        <span className="w-px h-4 bg-gray-200" />

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => handleShare("whatsapp")}
            title="Share on WhatsApp"
            className="p-1.5 text-gray-600 hover:text-[#25D366] hover:bg-emerald-50 rounded-full transition cursor-pointer"
          >
            <FaWhatsapp className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => handleShare("linkedin")}
            title="Share on LinkedIn"
            className="p-1.5 text-gray-600 hover:text-[#0A66C2] hover:bg-blue-50 rounded-full transition cursor-pointer"
          >
            <FaLinkedinIn className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => handleShare("twitter")}
            title="Share on X"
            className="p-1.5 text-gray-600 hover:text-black hover:bg-gray-100 rounded-full transition cursor-pointer"
          >
            <FaXTwitter className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleCopyLink}
            title="Copy link"
            className="p-1.5 text-gray-600 hover:text-royal hover:bg-blue-50 rounded-full transition cursor-pointer"
          >
            {copiedLink ? (
              <CheckIcon className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <LinkIcon className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </aside>
    </div>
  );
};