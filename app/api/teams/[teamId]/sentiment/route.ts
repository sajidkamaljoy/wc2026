import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getTeamNews } from "@/lib/news-api";
import Sentiment from "sentiment";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    const { teamId } = await params;

    // 1. Look up the team's full name from our database
    const team = await prisma.team.findUnique({
      where: { id: teamId.toUpperCase() },
      select: { name: true }
    });

    if (!team) {
      return NextResponse.json(
        { error: `Team ${teamId} not found` },
        { status: 404 }
      );
    }

    const teamName = team.name;

    // 2. Fetch team-specific news (10 articles max)
    const articles = await getTeamNews(teamName);

    if (!articles || articles.length === 0) {
      return NextResponse.json({
        score: 0,
        label: "Neutral",
        emoji: "😐",
        colorClass: "text-slate-400 bg-slate-400/10 border-slate-400/20",
        barColorClass: "bg-slate-400",
        articlesAnalyzed: 0,
        headlines: []
      });
    }

    let headlines: {
      title: string;
      url: string;
      source: string;
      publishedAt: string;
      sentiment: number;
    }[] = [];
    let averageScore = 0;
    let analyzedWithGemini = false;

    // 3. Try to use Gemini API for advanced, context-aware sentiment analysis
    if (process.env.GEMINI_API_KEY) {
      try {
        const prompt = `You are a sports sentiment analyzer. Analyze the public fan mood and media sentiment for the soccer team "${teamName}" based on these ${articles.length} news headlines.
For each headline, assign a sentiment score between -5.0 (extremely negative/disastrous) and +5.0 (extremely positive/glorious). A score of 0.0 is completely neutral.
Also calculate the overall average sentiment score for the team.

Return ONLY a JSON object matching this schema:
{
  "averageScore": number, // between -5.0 and +5.0
  "headlines": [
    {
      "title": string, // must match the input title exactly
      "score": number // between -5.0 and +5.0
    }
  ]
}

Input Headlines:
${articles.map((a, i) => `${i + 1}. ${a.title}`).join("\n")}
`;

        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    {
                      text: prompt,
                    },
                  ],
                },
              ],
              generationConfig: {
                responseMimeType: "application/json",
              },
            }),
          }
        );

        if (!geminiRes.ok) {
          throw new Error(`Gemini API returned status ${geminiRes.status}`);
        }

        const geminiData = await geminiRes.json();
        const textResponse = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!textResponse) {
          throw new Error("Invalid response structure from Gemini API");
        }

        const parsed = JSON.parse(textResponse);
        
        headlines = articles.map((article) => {
          const parsedItem = parsed.headlines?.find(
            (h: any) => h.title?.toLowerCase() === article.title?.toLowerCase()
          );
          const sentimentScore = parsedItem ? parsedItem.score : 0;
          return {
            title: article.title,
            url: article.url,
            source: article.source,
            publishedAt: article.publishedAt,
            sentiment: Math.round(sentimentScore * 100) / 100
          };
        });

        averageScore = parsed.averageScore ?? (headlines.reduce((acc, h) => acc + h.sentiment, 0) / headlines.length);
        analyzedWithGemini = true;
      } catch (geminiError) {
        console.error("Gemini sentiment analysis failed, falling back to local library:", geminiError);
      }
    }

    // 4. Fallback to local lexicon sentiment analyzer if Gemini is not configured or failed
    if (!analyzedWithGemini) {
      const sentimentAnalyzer = new Sentiment();
      let totalScore = 0;

      headlines = articles.map((article) => {
        const result = sentimentAnalyzer.analyze(article.title);
        totalScore += result.score;

        return {
          title: article.title,
          url: article.url,
          source: article.source,
          publishedAt: article.publishedAt,
          sentiment: result.score
        };
      });

      averageScore = totalScore / articles.length;
    }

    // 5. Map average score to labels, emojis, and colors
    let label = "Neutral";
    let emoji = "😐";
    let colorClass = "text-slate-400 bg-slate-400/10 border-slate-400/20";
    let barColorClass = "bg-slate-400";

    if (averageScore > 2) {
      label = "Very Positive";
      emoji = "😍";
      colorClass = "text-emerald-400 bg-emerald-400/10 border-emerald-400/20";
      barColorClass = "bg-emerald-400";
    } else if (averageScore >= 0.5) {
      label = "Positive";
      emoji = "😊";
      colorClass = "text-green-400 bg-green-400/10 border-green-400/20";
      barColorClass = "bg-green-400";
    } else if (averageScore <= -2) {
      label = "Very Negative";
      emoji = "😡";
      colorClass = "text-red-400 bg-red-400/10 border-red-400/20";
      barColorClass = "bg-red-400";
    } else if (averageScore <= -0.5) {
      label = "Negative";
      emoji = "😟";
      colorClass = "text-orange-400 bg-orange-400/10 border-orange-400/20";
      barColorClass = "bg-orange-400";
    }

    return NextResponse.json({
      score: Math.round(averageScore * 100) / 100, // round to 2 decimals
      label,
      emoji,
      colorClass,
      barColorClass,
      articlesAnalyzed: articles.length,
      headlines
    });
  } catch (error) {
    console.error("Error in Fan Mood API Route:", error);
    return NextResponse.json(
      {
        score: 0,
        label: "Neutral",
        emoji: "😐",
        colorClass: "text-slate-400 bg-slate-400/10 border-slate-400/20",
        barColorClass: "bg-slate-400",
        articlesAnalyzed: 0,
        headlines: [],
        error: "Internal Server Error"
      },
      { status: 500 }
    );
  }
}
