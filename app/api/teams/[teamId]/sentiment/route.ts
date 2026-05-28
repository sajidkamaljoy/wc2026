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

    // 3. Use in-memory cache (1 hour TTL) to avoid hammering Hugging Face API on every page load
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
        let analyzedWithHF = false;

        // Try Hugging Face Inference API for advanced, transformer-based sentiment analysis
        if (process.env.HUGGINGFACE_API_KEY) {
          try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 1500);

            const hfRes = await fetch(
              "https://router.huggingface.co/hf-inference/models/cardiffnlp/twitter-roberta-base-sentiment-latest",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
                },
                body: JSON.stringify({ inputs: articles.map((a) => a.title) }),
                signal: controller.signal,
                cache: "no-store",
              }
            );
            clearTimeout(timeoutId);

            if (!hfRes.ok) {
              throw new Error(`Hugging Face API returned status ${hfRes.status}`);
            }

            const hfData = await hfRes.json();
            
            if (!Array.isArray(hfData)) {
              throw new Error("Invalid response structure from Hugging Face API");
            }

            headlines = articles.map((article, idx) => {
              const predictions = hfData[idx];
              let sentimentScore = 0;

              if (Array.isArray(predictions)) {
                let positiveProb = 0;
                let negativeProb = 0;

                for (const pred of predictions) {
                  const label = pred.label?.toLowerCase() || "";
                  const score = pred.score || 0;
                  if (label === "positive" || label === "label_2" || label === "pos" || label.includes("positive")) {
                    positiveProb = score;
                  } else if (label === "negative" || label === "label_0" || label === "neg" || label.includes("negative")) {
                    negativeProb = score;
                  }
                }
                sentimentScore = (positiveProb * 5.0) - (negativeProb * 5.0);
              }

              return {
                title: article.title,
                url: article.url,
                source: article.source,
                publishedAt: article.publishedAt,
                sentiment: Math.round(sentimentScore * 100) / 100
              };
            });

            averageScore = headlines.reduce((acc, h) => acc + h.sentiment, 0) / headlines.length;
            analyzedWithHF = true;
          } catch (hfError: any) {
            const isTimeout = hfError.name === "AbortError";
            if (isTimeout) {
              console.warn("⚠️ [Hugging Face API] Request timed out (1.5s). Falling back gracefully to local lexicon analysis.");
            } else {
              console.warn("⚠️ [Hugging Face API] Sentiment analysis failed, falling back to local library:", hfError.message || hfError);
            }
          }
        }

        // Fallback to local lexicon sentiment analyzer if Hugging Face is not configured or failed
        if (!analyzedWithHF) {
          const sentimentAnalyzer = new Sentiment();
          const customLexicon = {
            // Positive sports words
            "masterclass": 4,
            "superb": 4,
            "outstanding": 4,
            "brilliant": 4,
            "glorious": 4,
            "triumph": 4,
            "triumphant": 4,
            "champion": 4,
            "win": 3,
            "wins": 3,
            "winning": 3,
            "won": 3,
            "unbeaten": 3,
            "undefeated": 3,
            "qualify": 3,
            "qualifies": 3,
            "qualified": 3,
            "dominate": 3,
            "dominating": 3,
            "dominated": 3,
            "impressive": 3,
            "star": 3,
            "hero": 3,
            "genius": 3,
            "confident": 2,
            "draw": 1,
            "draws": 1,
            "tie": 1,
            
            // Negative sports words
            "defeat": -3,
            "defeated": -3,
            "defeats": -3,
            "lose": -3,
            "loses": -3,
            "lost": -3,
            "loss": -3,
            "fail": -3,
            "fails": -3,
            "failed": -3,
            "failure": -3,
            "struggle": -2,
            "struggling": -2,
            "poor": -3,
            "weak": -3,
            "injured": -2,
            "injury": -2,
            "injuries": -2,
            "disaster": -4,
            "disastrous": -4,
            "devastated": -4,
            "eliminated": -4,
            "sacked": -4,
            "fired": -4,
            "crash": -4,
            "crashed": -4,
            "awful": -4,
            "terrible": -4,
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
      3600_000 // Cache for 1 hour
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
