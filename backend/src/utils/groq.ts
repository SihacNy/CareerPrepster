import { env } from '../config/env.js';
import { logger } from './logger.js';

export interface GroqChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export async function callGroqChatCompletion(params: {
  messages: GroqChatMessage[];
  model?: string;
  responseFormatJson?: boolean;
  temperature?: number;
}): Promise<string> {
  const apiKey = env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error('GROQ_API_KEY is not configured');
  }

  const model = params.model || env.GROQ_MODEL || 'openai/gpt-oss-120b';
  logger.debug('GroqClient', `Dispatching Groq chat completion [Model: ${model}]`);

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: params.messages,
      temperature: params.temperature ?? 0.6,
      ...(params.responseFormatJson ? { response_format: { type: 'json_object' } } : {}),
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    logger.error('GroqClient', `Groq API error [${response.status}]: ${errorText}`);
    throw new Error(`Groq API error [${response.status}]: ${errorText}`);
  }

  const data: any = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error('Groq API returned empty completion message');
  }

  return content;
}
