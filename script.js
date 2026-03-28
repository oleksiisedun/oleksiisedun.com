import { Terminal } from './terminal.js';
import { MochiRobot } from './mochi.js';
import { STATUS_BAR_HEIGHT } from './config.js';

document.documentElement.style.setProperty('--status-bar-height', `${STATUS_BAR_HEIGHT}px`);
document.documentElement.style.setProperty('--mochi-scale', String(STATUS_BAR_HEIGHT / 100 * 0.35));

new Terminal();
new MochiRobot();
