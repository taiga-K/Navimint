import { Agent } from '@cursor/february/agent';

import { createAnalyzeUiPrompt } from './create-analyze-ui-prompt';

export interface RunAnalyzeUiOptions {
  projectRoot: string;
  baseURL: string;
  apiKey: string;
}

export async function runAnalyzeUi(options: RunAnalyzeUiOptions): Promise<string> {
  const prompt = createAnalyzeUiPrompt(options);

  const result = await Agent.prompt(prompt, {
    apiKey: options.apiKey,
    model: { id: 'composer-2' },
    local: { cwd: options.projectRoot },
  });

  if (
    result.result === undefined ||
    result.result === null ||
    result.result.trim().length === 0
  ) {
    const streamedJson = await runAnalyzeUiWithStream(prompt, options);
    if (streamedJson !== null) {
      return streamedJson;
    }
  }

  if (result.status !== 'finished') {
    throw new Error(`Cursor agent finished with status "${result.status}"`);
  }
  if (
    result.result === undefined ||
    result.result === null ||
    result.result.trim().length === 0
  ) {
    throw new Error('Cursor agent returned an empty result');
  }
  return result.result;
}

async function runAnalyzeUiWithStream(
  prompt: string,
  options: RunAnalyzeUiOptions,
): Promise<string | null> {
  const agent = Agent.create({
    apiKey: options.apiKey,
    model: { id: 'composer-2' },
    local: { cwd: options.projectRoot },
  });
  try {
    const run = await agent.send(prompt);
    let concatenatedAssistantText = '';
    for await (const event of run.stream()) {
      concatenatedAssistantText += assistantTextFromEvent(event);
    }
    const waitResult = await run.wait();
    if (waitResult.status !== 'finished') {
      throw new Error(`Cursor agent stream finished with status "${waitResult.status}"`);
    }
    return extractJsonObject(concatenatedAssistantText);
  } catch {
    return null;
  } finally {
    try {
      await agent[Symbol.asyncDispose]();
    } catch {
      // Disposal errors must not replace a successful return or the catch fallback.
    }
  }
}

function extractJsonObject(value: string): string | null {
  const trimmed = value.trim();
  const firstBraceIndex = trimmed.indexOf('{');
  const lastBraceIndex = trimmed.lastIndexOf('}');
  if (firstBraceIndex === -1 || lastBraceIndex === -1 || firstBraceIndex > lastBraceIndex) {
    return null;
  }
  const candidate = trimmed.slice(firstBraceIndex, lastBraceIndex + 1);
  return canParseJson(candidate) ? candidate : null;
}

function canParseJson(value: string): boolean {
  try {
    JSON.parse(value);
    return true;
  } catch {
    return false;
  }
}

function assistantTextFromEvent(event: unknown): string {
  if (!isRecord(event) || event.type !== 'assistant' || !isRecord(event.message)) {
    return '';
  }
  const content = event.message.content;
  if (!Array.isArray(content)) {
    return '';
  }
  return content
    .map((block) => {
      if (!isRecord(block) || block.type !== 'text' || typeof block.text !== 'string') {
        return '';
      }
      return block.text;
    })
    .join('');
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
