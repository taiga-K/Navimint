import { promises as fs } from 'node:fs';
import path from 'node:path';

import { SCREENS_JSON_FILENAME } from '../../shared/constants';
import type { ScreensDocument } from '../../shared/types';

export interface WriteScreensDocumentOptions {
  projectRoot: string;
  document: ScreensDocument;
}

export async function writeScreensDocument(
  options: WriteScreensDocumentOptions,
): Promise<string> {
  const filePath = path.join(options.projectRoot, SCREENS_JSON_FILENAME);
  await fs.writeFile(filePath, `${JSON.stringify(options.document, null, 2)}\n`, 'utf8');
  return filePath;
}
