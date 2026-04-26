import path from 'node:path';

import { SCREENS_DOCUMENT_VERSION } from '../../shared/types';

export interface CreateAnalyzeUiPromptOptions {
  projectRoot: string;
  baseURL: string;
}

export function createAnalyzeUiPrompt(options: CreateAnalyzeUiPromptOptions): string {
  const projectName = path.basename(options.projectRoot);
  const projectNameLiteral = JSON.stringify(projectName);
  const baseUrlLiteral = JSON.stringify(options.baseURL);

  return `Analyze the UI source code under the current working directory and return a screens.json document for Navimint.

Rules:
- Do not modify, create, delete, or rename any files.
- Return only one raw JSON object. Do not wrap it in Markdown fences and do not add explanations.
- Use version "${SCREENS_DOCUMENT_VERSION}".
- Set project.name to ${projectNameLiteral} unless the code clearly identifies a better product name.
- Set project.baseURL exactly to ${baseUrlLiteral}. Do not infer or change it from source code.
- Include every user-facing page, route, modal-as-screen, and major app state that behaves like a screen.
- Prefer route patterns such as "/", "/settings", and "/users/:id".
- Use stable kebab-case screen ids.
- Keep screens[].id unique.
- transitions[].from and transitions[].to must reference existing screen ids.
- Use concise descriptions and concise transition triggers.

Required JSON shape:
{
  "version": "${SCREENS_DOCUMENT_VERSION}",
  "project": {
    "name": "project-name",
    "baseURL": ${baseUrlLiteral}
  },
  "screens": [
    {
      "id": "screen-id",
      "name": "ScreenName",
      "route": "/route",
      "description": "What the user sees here",
      "color": "#59C2D8"
    }
  ],
  "transitions": [
    {
      "from": "source-screen-id",
      "to": "target-screen-id",
      "trigger": "User action",
      "condition": "Optional condition"
    }
  ]
}`;
}
