export const PROMPT_TEXT = 'guest@oleksiisedun:~';
export const STATUS_BAR_HEIGHT = 75;
export const TERMINAL_FONT_SIZE = "1.5rem";
export const STATUS_BAR_FONT_SIZE = "16px";
export const MAIN_COLOR = "#6A9955";
export const GLOW_COLOR = "#3D5C33";
export const PIXEL_SIZE = 1;
export const BACKGROUND_COLOR = "#111111";
export const TYPING_DELAY = 10;
export const SMOKE_QUIT_DATE = new Date(2026, 1, 25);

// Terminal timing
export const SCROLL_REFLOW_DELAY = 50; // ms, allow DOM reflow before scrolling
export const MOBILE_KEYBOARD_DELAY = 300; // ms, wait for mobile keyboard animation

// External endpoints
export const ANALYTICS_ENDPOINT = 'https://analytics.oleksiisedun.workers.dev/';
export const CERTIFICATES_API_URL = 'https://api.github.com/repos/oleksiisedun/oleksiisedun.com/contents/certificates';

// Shared CSS class names (used by templates.js)
export const CSS_CLASS = {
  ANALYTICS_HEADER: 'analytics-header',
  ANALYTICS_VALUE: 'analytics-value',
  ERROR_TEXT: 'error-text',
  COMMAND_TOKEN: 'command-token',
};

// Mochi avatar tuning
export const MOCHI_EYE_MAX_DISTANCE = 15;
export const MOCHI_EYE_DISTANCE_DIVISOR = 10;
export const MOCHI_BLINK_DURATION = 200;
export const MOCHI_BLINK_MIN_INTERVAL = 2000;
export const MOCHI_BLINK_MAX_INTERVAL = 4000;
export const MOCHI_INITIAL_BLINK_DELAY = 2000;

/**
 * @typedef {Object} CommandConfig
 * @property {string|null} file - Static content filename under `commands/`, or `null` for a dynamic handler.
 * @property {string} description - Short description shown in `help`.
 */

/** @type {Object<string, CommandConfig>} */
export const COMMANDS = {
  help: { file: 'help.txt', description: 'List available commands' },
  about: { file: 'about.txt', description: 'About me' },
  skills: { file: 'skills.txt', description: 'My skills' },
  analytics: { file: null, description: 'Site analytics' },
  smoke: { file: null, description: 'Smoke-free tracker' },
  certificates: { file: null, description: 'My certificates' },
  clear: { file: null, description: 'Clear the terminal' },
};
