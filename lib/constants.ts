// Legacy constants - consider migrating to ConfigService
import { configService } from '@/lib/services';

export const PYODIDE_VERSION = configService.get('pyodideVersion');
export const PYODIDE_CDN_BASE_URL = configService.get('pyodideCdnBaseUrl');
export const PYODIDE_FULL_URL = configService.getPyodideFullUrl();

// Maintain backward compatibility with legacy property names
const contentVisibility = configService.get('contentVisibility');
export const CONTENT_VISIBILITY = {
  TEXT_MIN_LENGTH: contentVisibility.textMinLength,
  TEXT_MAX_LENGTH: contentVisibility.textMaxLength,
  CODE_MIN_LENGTH: contentVisibility.codeMinLength,
  CODE_MAX_LENGTH: contentVisibility.codeMaxLength,
} as const;

const streamDelays = configService.get('streamDelays');
export const STREAM_DELAYS = {
  FINISH_DELAY_MS: streamDelays.finishDelayMs,
} as const;

// UUID generation pattern
export const UUID_PATTERN = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx';
