import { getWorldCupNews } from "@/lib/news-api";
import { Newspaper } from "lucide-react";
import { format } from "date-fns";

export async function NewsFeed() {
  const articles = await getWorldCupNews();

  if (!articles.length) return null;

  return (
    <div className="flex flex-col gap-4 mb-10 w-full">
      <h2 className="text-xl md:text-2xl font-extrabold tracking-tight text-white flex items-center gap-2 border-b border-white/10 pb-3">
        <Newspaper className="h-6 w-6 text-amber-400" />
        Latest News
      </h2>
      <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-4 scrollbar-hide">
        {articles.map((article, i) => (
          <a
            key={i}
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col w-64 sm:w-72 h-52 shrink-0 snap-start rounded-2xl border border-white/10 bg-slate-900/60 overflow-hidden hover:border-amber-500/50 hover:shadow-[0_0_15px_rgba(251,191,36,0.15)] transition-all"
          >
            {article.image ? (
              <div className="h-28 w-full overflow-hidden">
                <img
                  src={article.image}
                  alt={article.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
            ) : (
              <div className="h-28 w-full bg-slate-800 flex items-center justify-center">
                <Newspaper className="h-8 w-8 text-slate-600" />
              </div>
            )}
            <div className="p-3 flex flex-col justify-between flex-1 min-w-0">
              <h3 className="font-bold text-xs sm:text-sm text-slate-200 line-clamp-2 group-hover:text-amber-400 transition-colors">
                {article.title}
              </h3>
              <div className="flex items-center justify-between text-[10px] sm:text-xs text-slate-500 mt-1">
                <span className="font-semibold text-slate-400 truncate max-w-[65%]">{article.source}</span>
                <span>{format(new Date(article.publishedAt), "MMM d")}</span>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
