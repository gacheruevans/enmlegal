import { ChevronRightIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import Markdown from "react-markdown";
import api from "../../lib/api";

type BlogPostDetail = {
  id: string;
  title: string;
  description: string;
  content: string;
  date: string;
  datetime: string;
  imageUrl?: string | null;
  status?: string;
  category?: { title?: string } | null;
  author?: { name?: string } | null;
};

const samplePosts: BlogPostDetail[] = [
  {
    id: "sample-1",
    title: "Probate Administration: Navigating the Legal Landscape",
    description:
      "A practical guide to understanding the probate process in Kenya and the responsibilities of executors, administrators, and beneficiaries.",
    content:
      "Probate administration requires careful planning, accurate documentation, and sound legal guidance. This article outlines the practical steps involved in estate administration in Kenya, including obtaining grants, proving the will, identifying assets, settling liabilities, and distributing the estate in accordance with the law.",
    date: "Mar 16, 2025",
    datetime: "2025-03-16",
    category: { title: "Administration" },
    author: { name: "Advocate Eva Nduta Munene" },
  },
  {
    id: "sample-2",
    title: "Real Estate & Conveyancing: A Comprehensive Guide",
    description:
      "A clear overview of conveyancing steps from search to transfer, with practical guidance for buyers, sellers, and investors.",
    content:
      "Conveyancing in Kenya involves due diligence, sale agreement review, title verification, transfer documentation, and registration safeguards that protect both the buyer and the seller. A strong legal process helps avoid disputes later and ensures that ownership is transferred correctly.",
    date: "Apr 16, 2025",
    datetime: "2025-04-16",
    category: { title: "Realestate" },
    author: { name: "Advocate Eva Nduta Munene" },
  },
  {
    id: "sample-3",
    title: "Banking Securities: An Introduction to Banking Securities & Collateral Law in Kenya",
    description:
      "An introduction to secured lending, collateral, and the legal structure of banking securities in Kenya.",
    content:
      "Collateral and banking securities should be structured and documented carefully to ensure legal enforceability and protection for all parties involved. This article explains how charges, mortgages, and debentures fit into secured lending arrangements.",
    date: "Jun 16, 2025",
    datetime: "2025-06-16",
    category: { title: "Banking" },
    author: { name: "Advocate Eva Nduta Munene" },
  },
  {
    id: "sample-4",
    title: "Dispute Resolution: Effective Strategies for Resolving Legal Conflicts",
    description:
      "A balanced perspective on mediation, arbitration, and litigation for efficient dispute resolution.",
    content:
      "Effective dispute resolution strategies often balance legal rights, business goals, and long-term relationships. This article highlights the practical differences between mediation, arbitration, and litigation in the Kenyan context.",
    date: "Apr 16, 2024",
    datetime: "2024-04-16",
    category: { title: "Social" },
    author: { name: "Advocate Eva Nduta Munene" },
  },
  {
    id: "sample-5",
    title: "Startups & SMEs: Legal Essentials for Entrepreneurs",
    description:
      "A practical legal checklist for founders navigating registration, contracts, funding, and compliance.",
    content:
      "Startups need a strong legal foundation from incorporation through funding agreements and day-to-day governance. This article covers the key legal essentials for founders and SMEs in Kenya as they scale and grow.",
    date: "May 16, 2024",
    datetime: "2024-05-16",
    category: { title: "Startups" },
    author: { name: "Advocate Eva Nduta Munene" },
  },
  {
    id: "sample-6",
    title: "Legal Audit & Compliance: Ensuring Your Business Meets Regulatory Standards",
    description:
      "How legal audits help organizations identify compliance risks, strengthen controls, and prevent penalties.",
    content:
      "Legal compliance reviews help businesses identify gaps, improve controls, and reduce exposure to regulatory penalties. This article explains why proactive legal audits remain a valuable tool for modern organizations.",
    date: "Jun 16, 2024",
    datetime: "2024-06-16",
    category: { title: "Audits" },
    author: { name: "Advocate Eva Nduta Munene" },
  },
];

export const ViewPost = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState<BlogPostDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPost = async () => {
      if (!id) {
        setError("The requested post could not be found.");
        setLoading(false);
        return;
      }

      const sampleMatch = samplePosts.find((entry) => entry.id === id);
      if (sampleMatch) {
        setPost(sampleMatch);
        setLoading(false);
        return;
      }

      try {
        const { data } = await api.get(`/posts/${id}`);
        setPost(data);
      } catch {
        setError("The requested article is not available right now.");
      } finally {
        setLoading(false);
      }
    };

    loadPost();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen px-6 py-24 bg-white">
        <div className="text-sm text-gray-500">Loading article...</div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen px-6 py-24 bg-white">
        <div className="max-w-3xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 mb-10 font-bold transition-colors text-emerald-600 hover:text-emerald-700"
          >
            <ChevronRightIcon className="h-5 rotate-180" />
            Back to articles
          </button>
          <div className="p-8 text-sm text-gray-600 border border-gray-200 rounded-lg bg-gray-50">
            {error || "The requested article could not be found."}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-24 bg-white">
      <div className="max-w-4xl px-6 mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 mb-12 font-bold transition-colors text-emerald-600 hover:text-emerald-700 group"
        >
          <ChevronRightIcon className="h-5 rotate-180" />
          Back to Articles
        </button>

        <article className="prose prose-lg prose-slate max-w-none">
          <div className="mb-12">
            <div className="flex items-center gap-4 mb-6">
              <span className="px-3 py-1 text-xs font-bold tracking-widest uppercase rounded-full bg-emerald-100 text-emerald-700">
                {post.category?.title || "Legal Insight"}
              </span>
              <span className="text-sm tracking-widest uppercase text-slate-400">{post.date}</span>
            </div>
            <h1 className="mb-8 text-4xl font-bold leading-tight tracking-tight font-display md:text-5xl lg:text-6xl text-slate-900">
              {post.title}
            </h1>
            {post.imageUrl ? (
              <div className="mb-12 overflow-hidden shadow-xl rounded-3xl">
                <img src={post.imageUrl} alt={post.title} className="object-cover w-full aspect-video" referrerPolicy="no-referrer" />
              </div>
            ) : null}
          </div>

          <div className="leading-relaxed markdown-body text-slate-700">
            <Markdown>{post.content}</Markdown>
          </div>

          {post.description ? (
            <div className="pt-8 mt-8 text-sm border-t border-slate-100 text-slate-600">
              <strong className="text-slate-900">Summary:</strong> {post.description}
            </div>
          ) : null}
        </article>
      </div>
    </div>
  );
};