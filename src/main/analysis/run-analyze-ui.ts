import { Agent } from '@cursor/february/agent';

import { createAnalyzeUiPrompt } from './create-analyze-ui-prompt';

export interface RunAnalyzeUiOptions {
  projectRoot: string;
  baseURL: string;
  apiKey: string;
}

export async function runAnalyzeUi(options: RunAnalyzeUiOptions): Promise<string> {
  const result = await Agent.prompt(createAnalyzeUiPrompt(options), {
    apiKey: options.apiKey,
    model: { id: 'composer-2' },
    local: { cwd: options.projectRoot },
  });

  if (result.status !== 'finished') {
    throw new Error(`Cursor agent finished with status "${result.status}"`);
  }
  if (result.result === undefined || result.result.trim().length === 0) {
    throw new Error('Cursor agent returned an empty result');
  }
  return result.result;
}
