const NEWS_API_KEY = process.env.NEWS_API_KEY;

export interface NewsArticle {
  title: string;
  url: string;
  image?: string;
  source: string;
  publishedAt: string;
}

export async function getWorldCupNews(): Promise<NewsArticle[]> {
  if (!NEWS_API_KEY) {
    // Return mock data if no key is provided
    return [
      {
        title: "FIFA Announces Expanded 48-Team Format for 2026 World Cup",
        url: "#",
        source: "FIFA Official",
        publishedAt: new Date().toISOString(),
        image: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=600&auto=format&fit=crop",
      },
      {
        title: "MetLife Stadium Prepares for the Grand Final",
        url: "#",
        source: "Sports Network",
        publishedAt: new Date(Date.now() - 86400000).toISOString(),
        image: "https://images.unsplash.com/photo-1522778119026-d647f0596c20?q=80&w=600&auto=format&fit=crop",
      },
      {
        title: "USA, Mexico, and Canada Ready to Host the World",
        url: "#",
        source: "Global News",
        publishedAt: new Date(Date.now() - 172800000).toISOString(),
        image: "https://images.unsplash.com/photo-1518605368461-1ee7c5320c28?q=80&w=600&auto=format&fit=crop",
      }
    ];
  }

  // Example implementation for GNews API
  try {
    const res = await fetch(
      `https://gnews.io/api/v4/search?q="World Cup 2026"&lang=en&max=3&apikey=${NEWS_API_KEY}`,
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) throw new Error("Failed to fetch news");
    const data = await res.json();
    
    return data.articles.map((article: any) => ({
      title: article.title,
      url: article.url,
      image: article.image,
      source: article.source.name,
      publishedAt: article.publishedAt,
    }));
  } catch (error) {
    console.error(error);
    return [];
  }
}
