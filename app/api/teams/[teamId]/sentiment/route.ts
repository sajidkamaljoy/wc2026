import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getTeamNews } from "@/lib/news-api";
import Sentiment from "sentiment";
import { memCache } from "@/lib/mem-cache";

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

    // 3. Use in-memory cache (2 hours TTL) to avoid hammering Groq API on every page load
    const sentimentResult = await memCache(
      `sentiment-${teamId}`,
      async () => {
        let headlines: {
          title: string;
          url: string;
          source: string;
          publishedAt: string;
          sentiment: number;
        }[] = [];
        let averageScore = 0;
        let analyzedWithGroq = false;

        // Try Groq API for advanced, transformer-based sentiment analysis
        if (process.env.GROQ_API_KEY) {
          try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);

            const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
              },
              body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                max_tokens: 500,
                messages: [
                  {
                    role: "system",
                    content: `You are a football sentiment analyzer for the FIFA World Cup 2026.
Given a list of English news headlines about a national football team, return a JSON array
of sentiment scores from -5.0 (very negative) to +5.0 (very positive) for each headline.

Football-specific rules:
- Goals, wins, qualification, clean sheets, hat-tricks = positive
- Injuries, red cards, VAR controversy, elimination, manager sacked = negative
- "upset" means underdog won = context-dependent
- Draws = slightly negative for favourites, positive for underdogs
- Penalty shootout loss = very negative (-4 to -5)

Return ONLY valid JSON with no preamble:
[{"score": 2.5}, {"score": -3.0}, ...]`
                  },
                  {
                    role: "user",
                    content: articles.map((a, i) => `${i + 1}. ${a.title}`).join("\n")
                  }
                ]
              }),
              signal: controller.signal,
            });
            clearTimeout(timeoutId);

            if (!groqRes.ok) {
              throw new Error(`Groq API returned status ${groqRes.status}`);
            }

            const groqData = await groqRes.json();
            const content = groqData.choices?.[0]?.message?.content || "[]";
            const scores = JSON.parse(content.replace(/```json|```/g, "").trim());

            headlines = articles.map((article, idx) => ({
              title: article.title,
              url: article.url,
              source: article.source,
              publishedAt: article.publishedAt,
              sentiment: scores[idx]?.score ?? 0
            }));

            averageScore = headlines.reduce((acc, h) => acc + h.sentiment, 0) / headlines.length;
            analyzedWithGroq = true;
          } catch (groqError: unknown) {
            const err = groqError as { name?: string; message?: string };
            const isTimeout = err.name === "AbortError";
            const isRateLimit = err.message?.includes("429") || String(err).includes("429");

            if (isTimeout) {
              console.warn("⚠️ [Groq] Timed out — falling back to local lexicon");
            } else if (isRateLimit) {
              console.warn("⚠️ [Groq] Rate limit hit — falling back to local lexicon");
            } else {
              console.warn("⚠️ [Groq] Failed:", err.message || err);
            }
            // analyzedWithGroq stays false → lexicon fallback runs
          }
        }

        // Fallback to local lexicon sentiment analyzer if Groq is not configured or failed
        if (!analyzedWithGroq) {
          const sentimentAnalyzer = new Sentiment();
          const customLexicon = {
            // Strongly Positive
            "champion":      4,  "champions":     4,
            "trophy":        4,  "glory":         4,
            "masterclass":   4,  "brilliant":     4,
            "hat-trick":     4,  "hat trick":     4,
            "triumph":       4,  "triumphant":    4,
            "superb":        4,  "outstanding":   4,
            "glorious":      4,

            // Positive
            "win":           3,  "wins":          3,
            "won":           3,  "winning":       3,
            "qualify":       3,  "qualified":     3,
            "dominate":      3,  "dominated":     3,
            "unbeaten":      3,  "undefeated":    3,
            "clean sheet":   3,  "comeback":      3,
            "impressive":    3,  "hero":          3,
            "star":          3,  "genius":        3,
            "boost":         3,  "advance":       3,

            // Slightly Positive
            "semifinal":     2,  "final":         2,
            "hope":          2,  "title":         2,
            "confident":     2,  "quarterfinal":  1,
            "draw":          1,  "draws":         1,
            "tie":           1,

            // Slightly Negative
            "doubt":        -1,  "fear":         -2,
            "struggle":     -2,  "struggling":   -2,
            "injured":      -2,  "injury":       -2,
            "injuries":     -2,  "suspended":    -2,
            "own goal":     -2,  "VAR":          -2,
            "controversy":  -2,  "row":          -2,
            "upset":        -2,  "weak":         -2,

            // Strongly Negative
            "defeat":       -3,  "defeated":     -3,
            "lose":         -3,  "lost":         -3,
            "loss":         -3,  "fail":         -3,
            "failed":       -3,  "failure":      -3,
            "poor":         -3,  "blow":         -3,
            "crisis":       -3,  "red card":     -3,
            "knockout":     -3,

            // Very Negative
            "eliminated":   -4,  "sacked":       -4,
            "fired":        -4,  "disaster":     -4,
            "disastrous":   -4,  "devastated":   -4,
            "crash":        -4,  "crashed":      -4,
            "awful":        -4,  "terrible":     -4,
            "heartbreak":   -4,  "relegated":    -4,
            "banned":       -4,
          };

          let totalScore = 0;

          headlines = articles.map((article) => {
            const result = sentimentAnalyzer.analyze(article.title, { extras: customLexicon });
            let localScore = result.score;
            if (localScore > 5) localScore = 5;
            if (localScore < -5) localScore = -5;
            totalScore += localScore;

            return {
              title: article.title,
              url: article.url,
              source: article.source,
              publishedAt: article.publishedAt,
              sentiment: localScore
            };
          });

          averageScore = totalScore / articles.length;
        }

        return { headlines, averageScore };
      },
      7200_000 // Cache for 2 hours (7200000 ms)
    );

    const { headlines, averageScore } = sentimentResult;

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
