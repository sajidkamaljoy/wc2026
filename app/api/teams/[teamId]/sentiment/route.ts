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

    // 3. Initialize sentiment analyzer and score articles
    const sentimentAnalyzer = new Sentiment();
    let totalScore = 0;

    const headlines = articles.map((article) => {
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

    const averageScore = totalScore / articles.length;

    // 4. Map average score to labels, emojis, and colors
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
