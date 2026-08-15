export function getMiniMaxConfig() {
  if (!process.env.MINIMAX_API_KEY) {
    try {
      process.loadEnvFile();
    } catch (error) {
      if (error?.code !== "ENOENT") throw error;
    }
  }

  const apiKey = process.env.MINIMAX_API_KEY;
  if (!apiKey) {
    throw new Error("MINIMAX_API_KEY is required in the environment or .env file");
  }

  const baseUrl = (process.env.MINIMAX_BASE_URL || "https://api.minimaxi.com").replace(/\/+$/, "");
  return { apiKey, baseUrl };
}