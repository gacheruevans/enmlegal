import { ChevronRightIcon, PrinterIcon } from "@heroicons/react/24/outline";
import Markdown from "react-markdown";


export const ViewPost = ({ post, onBack }: { post: BlogPost | null, onBack: () => void }) => {
  if (!post) return null;
  return (
    <div className="min-h-screen pt-32 pb-24 bg-white">
      <div className="max-w-4xl px-6 mx-auto">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 mb-12 font-bold transition-colors text-emerald-600 hover:text-emerald-700 group"
        >
          <ChevronRightIcon className="h-5 rotate-180" />
          Back to Articles
        </button>

        <article className="prose prose-lg prose-slate max-w-none">
          <div className="mb-12">
            <div className="flex items-center gap-4 mb-6">
              <span className="px-3 py-1 text-xs font-bold tracking-widest uppercase rounded-full bg-emerald-100 text-emerald-700">
                {post.category}
              </span>
              <span className="text-sm tracking-widest uppercase text-slate-400">{post.date} &bull; {post.readTime}</span>
            </div>
            <h1 className="mb-8 text-4xl font-bold leading-tight tracking-tight font-display md:text-5xl lg:text-6xl text-slate-900">
              {post.title}
            </h1>
            <div className="mb-12 overflow-hidden shadow-xl rounded-3xl">
              <img src={post.image} alt={post.title} className="object-cover w-full aspect-video" referrerPolicy="no-referrer" />
            </div>
          </div>

          <div className="leading-relaxed markdown-body text-slate-700">
            <Markdown>{post.content}</Markdown>
          </div>

          <div className="pt-12 mt-16 border-t border-slate-100">
            <div className="flex flex-col items-center justify-between gap-8 p-8 text-white bg-slate-900 rounded-3xl sm:p-12 sm:flex-row">
              <div className="text-center sm:text-left">
                <h3 className="mb-2 text-2xl font-bold">Want to save this for later?</h3>
                <p className="text-slate-400">Download the full technical whitepaper in PDF format.</p>
              </div>
              <button className="flex items-center gap-2 px-8 py-4 font-bold text-white transition-all bg-emerald-500 hover:bg-emerald-600 rounded-xl whitespace-nowrap">
                <PrinterIcon className="h-7" />
                Get the PDF
              </button>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
};