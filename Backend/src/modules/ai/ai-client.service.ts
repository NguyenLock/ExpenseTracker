import { BadGatewayException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface AiToolCall {
  id: string;
  type: 'function';
  function: { name: string; arguments: string };
}

export interface AiMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string | null;
  tool_calls?: AiToolCall[];
  tool_call_id?: string;
}

export interface AiToolDefinition {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
  };
}

/**
 * Thin wrapper around an OpenAI-compatible `/chat/completions` endpoint.
 * Swap provider by changing AI_BASE_URL / AI_API_KEY / AI_MODEL env vars only.
 */
@Injectable()
export class AiClientService {
  constructor(private readonly config: ConfigService) {}

  async chatCompletion(options: {
    messages: AiMessage[];
    tools?: AiToolDefinition[];
    jsonMode?: boolean;
  }): Promise<AiMessage> {
    const baseUrl = this.config.get<string>('AI_BASE_URL');
    const apiKey = this.config.get<string>('AI_API_KEY');
    const model = this.config.get<string>('AI_MODEL', 'gpt-4o-mini');

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: options.messages,
        ...(options.tools ? { tools: options.tools, tool_choice: 'auto' } : {}),
        ...(options.jsonMode
          ? { response_format: { type: 'json_object' } }
          : {}),
      }),
    }).catch((error: unknown) => {
      throw new BadGatewayException(
        `Failed to reach AI provider: ${(error as Error).message}`,
      );
    });

    if (!response.ok) {
      const body = await response.text().catch(() => '');
      throw new BadGatewayException(
        `AI provider returned ${response.status}: ${body.slice(0, 500)}`,
      );
    }

    const data = (await response.json()) as {
      choices: { message: AiMessage }[];
    };

    const message = data.choices?.[0]?.message;
    if (!message) {
      throw new BadGatewayException('AI provider returned no message');
    }
    return message;
  }
}
