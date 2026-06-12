import { z } from "zod";

// Regular expression to match exactly 3 uppercase letters (FIFA team code)
const TEAM_ID_REGEX = /^[A-Z]{3}$/;

export const predictionSchema = z.object({
  matchId: z.string().min(1, "Match ID is required"),
  homeScore: z
    .number()
    .int("Score must be an integer")
    .nonnegative("Score cannot be negative")
    .max(99, "Score cannot exceed 99"),
  awayScore: z
    .number()
    .int("Score must be an integer")
    .nonnegative("Score cannot be negative")
    .max(99, "Score cannot exceed 99"),
});

export const bracketPredictionSchema = z.object({
  groupRankings: z.record(
    z.string().regex(/^[A-L]$/, "Group key must be A-L"),
    z.array(z.string().regex(TEAM_ID_REGEX, "Team ID must be a 3-letter FIFA code")).length(4, "Each group must rank exactly 4 teams")
  ),
  thirdPlaces: z
    .array(z.string().regex(/^[A-L]$/, "Third place choice must be a group ID A-L"))
    .length(8, "Must select exactly 8 group IDs for 3rd place advancement"),
  knockoutPicks: z.record(
    z.string().regex(/^(7[3-9]|8[0-9]|9[0-9]|10[0-4])$/, "Match number must be between 73 and 104"),
    z.string().regex(TEAM_ID_REGEX, "Winner Team ID must be a 3-letter FIFA code")
  ),
});
