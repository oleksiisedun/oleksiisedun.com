import { Terminal } from './terminal.js';
import { MochiRobot } from './mochi.js';
import { registerServiceWorker } from './pwa.js';
import { STATUS_BAR_HEIGHT, TERMINAL_FONT_SIZE, STATUS_BAR_FONT_SIZE, MAIN_COLOR, GLOW_COLOR, PIXEL_SIZE, BACKGROUND_COLOR, GITHUB_PROFILE_URL } from './config.js';

/**
 * Converts a hex color (e.g. `#33ff00` or `#3f0`) to a `R, G, B` string
 * suitable for use inside a CSS `rgb()`/`rgba()` function.
 * @param {string} hex - The hex color, with or without a leading `#`.
 * @returns {string} The color as a comma-separated `R, G, B` string.
 */
function hexToRgbStr(hex) {
    hex = hex.replace(/^#/, '');
    if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
    return `${parseInt(hex.slice(0, 2), 16)}, ${parseInt(hex.slice(2, 4), 16)}, ${parseInt(hex.slice(4, 6), 16)}`;
}

document.documentElement.style.setProperty('--status-bar-height', `${STATUS_BAR_HEIGHT}px`);
document.documentElement.style.setProperty('--mochi-scale', String(STATUS_BAR_HEIGHT / 100 * 0.35));
document.documentElement.style.setProperty('--terminal-font-size', TERMINAL_FONT_SIZE);
document.documentElement.style.setProperty('--status-bar-font-size', STATUS_BAR_FONT_SIZE);
document.documentElement.style.setProperty('--main-color', MAIN_COLOR);
document.documentElement.style.setProperty('--bg-color', BACKGROUND_COLOR);
document.documentElement.style.setProperty('--main-color-rgb', hexToRgbStr(MAIN_COLOR));
document.documentElement.style.setProperty('--glow-color', GLOW_COLOR);
document.documentElement.style.setProperty('--scanline-width', `${PIXEL_SIZE * 3}px`);
document.documentElement.style.setProperty('--scanline-height', `${PIXEL_SIZE * 2}px`);
document.getElementById('github-link').href = GITHUB_PROFILE_URL;

new Terminal();
new MochiRobot();
registerServiceWorker();
