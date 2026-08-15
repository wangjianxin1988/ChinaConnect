import fs from "fs";
import path from "path";

const PROVIDERS = {
  deepseek: {
    apiKey: () => process.env.DEEPSEEK_API_KEY,
    baseUrl: () => process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com/v1",
    model: () => process.env.DEEPSEEK_MODEL || "deepseek-chat",
  },
  dashscope: {
    apiKey: () => process.env.DASHSCOPE_API_KEY || process.env.QWEN_API_KEY,
    baseUrl: () => "https://dashscope.aliyuncs.com/compatible-mode/v1",
    model: () => process.env.QWEN_MODEL || "qwen-plus",
  },
  moonshot: {
    apiKey: () => process.env.MOONSHOT_API_KEY,
    baseUrl: () => "https://api.moonshot.cn/v1",
    model: () => process.env.MOONSHOT_MODEL || "moonshot-v1-32k",
  },
  openai: {
    apiKey: () => process.env.OPENAI_API_KEY,
    baseUrl: () => process.env.OPENAI_BASE_URL || "https://api.openai.com/v1",
    model: () => process.env.OPENAI_MODEL || "gpt-4o-mini",
  },
};

function resolveProvider(name) {
  const provider = PROVIDERS[name];
  if (!provider) throw new Error(`Unknown TRANSLATE_PROVIDER=${name}`);
  const apiKey = provider.apiKey();
  if (!apiKey) throw new Error(`TRANSLATE_PROVIDER=${name} selected but no API key in environment`);
  return { apiKey, baseUrl: provider.baseUrl().replace(/\/v1\/?$/, ""), model: provider.model() };
}

function loadMiniMaxConfig() {
  if (!process.env.MINIMAX_API_KEY) {
    try {
      process.loadEnvFile();
    } catch (error) {
      if (error?.code !== "ENOENT") throw error;
    }
  }
  return {
    apiKey: process.env.MINIMAX_API_KEY,
    baseUrl: (process.env.MINIMAX_BASE_URL || "https://api.minimaxi.com").replace(/\/+$/, ""),
    model: process.env.MINIMAX_MODEL || "MiniMax-Text-01",
  };
}

export function getTranslateProvider() {
  const explicit = process.env.TRANSLATE_PROVIDER;
  if (explicit) return resolveProvider(explicit);
  if (process.env.TRANSLATE_BASE_URL) {
    return {
      apiKey: process.env.TRANSLATE_API_KEY || process.env.DEEPSEEK_API_KEY,
      baseUrl: process.env.TRANSLATE_BASE_URL,
      model: process.env.TRANSLATE_MODEL || "deepseek-chat",
    };
  }
  if (process.env.DEEPSEEK_API_KEY) return resolveProvider("deepseek");
  if (process.env.DASHSCOPE_API_KEY || process.env.QWEN_API_KEY) return resolveProvider("dashscope");
  return loadMiniMaxConfig();
}
