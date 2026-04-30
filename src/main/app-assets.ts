import path from 'node:path';

const resourcesPath = path.join(__dirname, '..', '..', 'resources');

export const appIconPngPath = path.join(resourcesPath, 'icon.png');
export const appIconIcoPath = path.join(resourcesPath, 'icon.ico');
export const appWindowIconPath = process.platform === 'win32' ? appIconIcoPath : appIconPngPath;
