import { Terminal } from './terminal.js';
import { MochiRobot } from './mochi.js';
import { STATUS_BAR_HEIGHT, TERMINAL_FONT_SIZE, STATUS_BAR_FONT_SIZE } from './config.js';

document.documentElement.style.setProperty('--status-bar-height', `${STATUS_BAR_HEIGHT}px`);
document.documentElement.style.setProperty('--mochi-scale', String(STATUS_BAR_HEIGHT / 100 * 0.35));
document.documentElement.style.setProperty('--terminal-font-size', TERMINAL_FONT_SIZE);
document.documentElement.style.setProperty('--status-bar-font-size', STATUS_BAR_FONT_SIZE);

new Terminal();
new MochiRobot();
