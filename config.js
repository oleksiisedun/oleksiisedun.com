export const PROMPT_TEXT = 'guest@oleksiisedun:~';
export const STATUS_BAR_HEIGHT = 75;
export const TERMINAL_FONT_SIZE = "1.5rem";
export const STATUS_BAR_FONT_SIZE = "16px";
export const MAIN_COLOR = "#33ff00";
export const GLOW_COLOR = "#138a03";
export const PIXEL_SIZE = 1;
export const BACKGROUND_COLOR = "#111111";
export const TYPING_DELAY = 10;
export const SMOKE_QUIT_DATE = new Date(2026, 1, 25);

export const COMMANDS = {
  help: { file: 'help.txt', description: 'List available commands' },
  about: { file: 'about.txt', description: 'About me' },
  skills: { file: 'skills.txt', description: 'My skills' },
  analytics: { file: null, description: 'Site analytics' },
  smoke: { file: null, description: 'Smoke-free tracker' },
  sertificates: { file: null, description: 'My certificates' },
  clear: { file: null, description: 'Clear the terminal' },
};

export const welcomeMessage = [
  "Initializing secure connection...",
  "Loading command line...",
  "Type 'help' for a list of commands."
];
