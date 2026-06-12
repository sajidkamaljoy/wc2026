const NEWS_API_KEY = process.env.NEWS_API_KEY;

export interface NewsArticle {
  title: string;
  url: string;
  image?: string;
  source: string;
  publishedAt: string;
}

interface GNewsArticle {
  title: string;
  url: string;
  image?: string;
  source?: {
    name: string;
    url?: string;
  };
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
    const articles: GNewsArticle[] = data.articles ?? [];
    
    return articles.map((article: GNewsArticle) => ({
      title: article.title,
      url: article.url,
      image: article.image,
      source: article.source?.name || "News Source",
      publishedAt: article.publishedAt,
    }));
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function getTeamNews(teamName: string): Promise<NewsArticle[]> {
  if (!NEWS_API_KEY) {
    // Return high-quality, team-specific mock news if no key is provided
    return [
      {
        title: `${teamName} squad prepares intensely for the upcoming World Cup clashes`,
        url: "#",
        source: "World Football Daily",
        publishedAt: new Date().toISOString(),
        image: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=600&auto=format&fit=crop",
      },
      {
        title: `Tactical Analysis: How ${teamName} plans to dominate their group stage matches`,
        url: "#",
        source: "Global Soccer Hub",
        publishedAt: new Date(Date.now() - 43200000).toISOString(),
        image: "https://images.unsplash.com/photo-1518605368461-1ee7c5320c28?q=80&w=600&auto=format&fit=crop",
      },
      {
        title: `Fans gather in huge numbers to support ${teamName} ahead of the tournament opener`,
        url: "#",
        source: "Sports Network",
        publishedAt: new Date(Date.now() - 86400000).toISOString(),
        image: "https://images.unsplash.com/photo-1522778119026-d647f0596c20?q=80&w=600&auto=format&fit=crop",
      }
    ];
  }

  try {
    // Fetch up to 10 articles for this specific team + World Cup + football
    const query = `"${teamName}" "World Cup" "football"`;
    const res = await fetch(
      `https://gnews.io/api/v4/search?q=${encodeURIComponent(query)}&lang=en&max=10&apikey=${NEWS_API_KEY}`,
      { next: { revalidate: 3600 } } // Cache for 1 hour to avoid API limit issues
    );
    
    if (!res.ok) {
      throw new Error(`GNews API request failed with status ${res.status}`);
    }
    
    const data = await res.json();
    const articles: GNewsArticle[] = data.articles;

    // De-duplicate articles by normalized title (lowercase, alphanumeric only)
    const seenTitles = new Set<string>();
    const uniqueArticles: GNewsArticle[] = [];

    for (const article of articles) {
      if (!article.title) continue;
      const normalizedTitle = article.title.toLowerCase().replace(/[^a-z0-9]/g, "").trim();
      if (!seenTitles.has(normalizedTitle)) {
        seenTitles.add(normalizedTitle);
        uniqueArticles.push(article);
      }
    }

    return uniqueArticles.map((article: GNewsArticle) => ({
      title: article.title,
      url: article.url,
      image: article.image,
      source: article.source?.name || "News Source",
      publishedAt: article.publishedAt,
    }));
  } catch (error) {
    console.error(`Error in getTeamNews for team ${teamName}:`, error);
    // Return fallback mock data on error so it never crashes
    return [
      {
        title: `Latest updates regarding ${teamName} training camp and player recovery`,
        url: "#",
        source: "Football News",
        publishedAt: new Date().toISOString(),
      }
    ];
  }
}

