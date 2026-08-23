export const PROMPT_TEXT = 'guest@oleksiisedun:~';
export const STATUS_BAR_HEIGHT = 75;
export const TERMINAL_FONT_SIZE = "1.5rem";
export const STATUS_BAR_FONT_SIZE = "16px";
export const MAIN_COLOR = "#00FF41";
export const GLOW_COLOR = "#009927";
export const PIXEL_SIZE = 1;
export const BACKGROUND_COLOR = "#111111";

// Delay in ms between each typed character in the typewriter output effect; lower = faster
export const TYPING_DELAY = 5;

/**
 * @typedef {Object} TrackerConfig
 * @property {string} icon - Font Awesome icon class (e.g. `fa-smoking-ban`), shown next to the label.
 * @property {string} label - Short heading for the tracker.
 * @property {string} prefix - Sentence lead-in, followed by the computed elapsed duration (e.g. "I haven't smoked for").
 * @property {string} date - Start date in `DD.MM.YYYY` format.
 */

/** @type {TrackerConfig[]} */
export const TRACKERS = [
  { icon: 'fa-smoking-ban', label: 'Smoke-Free', prefix: "I haven't smoked for", date: '25.02.2026' },
  { icon: 'fa-laptop-code', label: 'Working in IT', prefix: 'I have been working in IT for', date: '12.12.2011' },
];

// External endpoints
export const ANALYTICS_ENDPOINT = 'https://analytics.oleksiisedun.workers.dev/';
export const GITHUB_PROFILE_URL = 'https://github.com/oleksiisedun';

// Mochi avatar tuning
export const MOCHI_EYE_MAX_DISTANCE = 15;
export const MOCHI_EYE_DISTANCE_DIVISOR = 10;
export const MOCHI_BLINK_DURATION = 200;
export const MOCHI_BLINK_MIN_INTERVAL = 2000;
export const MOCHI_BLINK_MAX_INTERVAL = 4000;
export const MOCHI_INITIAL_BLINK_DELAY = 2000;

// Terminal timing
export const SCROLL_REFLOW_DELAY = 50; // ms, allow DOM reflow before scrolling
export const MOBILE_KEYBOARD_DELAY = 300; // ms, wait for mobile keyboard animation

// Matrix rain tuning (triple-tap/triple-click Mochi easter egg)
export const MATRIX_CHARS = 'ｦｱｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾂﾃﾅﾆﾇﾈﾊﾋﾎﾏﾐﾑﾒﾔﾕﾗﾘﾜｲﾁﾄﾉﾌﾍﾓﾖﾙﾚﾛﾝ0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
export const MATRIX_COLOR = MAIN_COLOR; // same authentic green as the rest of the theme
export const MATRIX_FONT_SIZE = 18; // px
export const MATRIX_FRAME_INTERVAL_MS = 40;
export const MATRIX_DROP_RESET_CHANCE = 0.975; // probability a column does NOT reset once past the bottom
export const MATRIX_TRIPLE_TAP_WINDOW_MS = 600;
// Whether to request fullscreen (hiding the mobile browser's address bar/toolbar) when the rain opens; off by default
export const MATRIX_HIDE_BROWSER_CHROME = false;

/**
 * @typedef {Object} CommandConfig
 * @property {string|null} file - Static content filename under `commands/`, or `null` for a dynamic handler.
 * @property {string} description - Short description shown in `help`.
 */

/** @type {Object<string, CommandConfig>} */
export const COMMANDS = {
  help: { file: 'help.txt', description: 'List available commands' },
  skills: { file: 'skills.txt', description: 'My skills' },
  analytics: { file: null, description: 'Site analytics' },
  trackers: { file: null, description: 'Life trackers' },
  clear: { file: null, description: 'Clear the terminal' },
};

// Shared CSS class names (used by templates.js)
export const CSS_CLASS = {
  SECTION_HEADER: 'section-header',
  VALUE_TEXT: 'value-text',
  ERROR_TEXT: 'error-text',
  COMMAND_TOKEN: 'command-token',
  NOTE_TEXT: 'note-text',
};