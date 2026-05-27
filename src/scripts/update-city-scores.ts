/**
 * City Scores Update Script
 * Run by GitHub Actions on schedule or manually
 *
 * Usage: pnpm exec tsx src/scripts/update-city-scores.ts
 */

import { cityScoringEngine, saveCityScores, saveCityScoreHistory } from "../lib/city-sources";
import { createScoreUpdateLog, updateScoreUpdateLog } from "../lib/city-sources/city-scores-db";

async function main() {
  const startTime = Date.now();
  const runId = `run-${Date.now()}`;

  console.log(`Starting city score update: ${runId}`);

  let logId: string | null = null;

  try {
    // Create update log entry
    logId = await createScoreUpdateLog(runId);
    console.log(`Created update log: ${logId}`);

    // Calculate all scores from data sources
    console.log("Calculating scores from data sources...");
    const summary = await cityScoringEngine.calculateAllScores();

    console.log(`Calculated scores for ${summary.totalCities} cities`);
    console.log(`Successful sources: ${summary.successfulSources}/${summary.successfulSources + summary.failedSources}`);

    // Save scores to database
    console.log("Saving scores to database...");
    const scores = summary.results.map((r) => r.scores);

    const saveResult = await saveCityScores(scores);
    if (!saveResult.success) {
      throw new Error(`Failed to save scores: ${saveResult.error}`);
    }
    console.log(`Saved scores for ${scores.length} cities`);

    // Save score history
    console.log("Saving score history...");
    const historyResult = await saveCityScoreHistory(scores);
    if (!historyResult.success) {
      console.warn(`Warning: Failed to save history: ${historyResult.error}`);
    }

    const duration = Date.now() - startTime;
    console.log(`Update completed in ${duration}ms`);

    // Update log with success
    if (logId) {
      await updateScoreUpdateLog(logId, {
        status: "success",
        cities_updated: scores.length,
        calculation_duration_ms: duration,
      });
    }

    process.exit(0);
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error("Error updating city scores:", error);

    // Update log with failure
    if (logId) {
      await updateScoreUpdateLog(logId, {
        status: "failed",
        calculation_duration_ms: duration,
        error_message: error instanceof Error ? error.message : String(error),
      });
    }

    process.exit(1);
  }
}

main();
