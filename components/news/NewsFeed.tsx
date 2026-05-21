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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {articles.map((article, i) => (
          <a
            key={i}
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col rounded-2xl border border-white/10 bg-slate-900/60 overflow-hidden hover:border-amber-500/50 hover:shadow-[0_0_15px_rgba(251,191,36,0.15)] transition-all"
          >
            {article.image && (
              <div className="h-40 w-full overflow-hidden">
                <img
                  src={article.image}
                  alt={article.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
            )}
            <div className="p-4 flex flex-col gap-2">
              <h3 className="font-bold text-sm text-slate-200 line-clamp-2 group-hover:text-amber-400 transition-colors">
                {article.title}
              </h3>
              <div className="flex items-center justify-between text-xs text-slate-500 mt-2">
                <span className="font-semibold text-slate-400">{article.source}</span>
                <span>{format(new Date(article.publishedAt), "MMM d")}</span>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
