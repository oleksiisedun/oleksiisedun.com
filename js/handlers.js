import { ANALYTICS_ENDPOINT, COMMANDS, SMOKE_QUIT_DATE } from './config.js';
import { analyticsConnectingTemplate, errorSpan, generateAnalyticsTemplate, generateCvTemplate, generateUnknownCommandTemplate, sectionHeader, valueSpan } from './templates.js';

/**
 * Builds the "Haven't smoked for ..." message based on the time elapsed since the quit date.
 * @param {Date} quitDate - The date smoking was quit.
 * @returns {string} HTML markup for a human-readable elapsed-time message.
 */
export const getSmokeFreeMessage = (quitDate) => {
  const now = new Date();
  let years = now.getFullYear() - quitDate.getFullYear();
  let months = now.getMonth() - quitDate.getMonth();
  let days = now.getDate() - quitDate.getDate();

  if (days < 0) {
    months--;
    days += new Date(now.getFullYear(), now.getMonth(), 0).getDate();
  }
  if (months < 0) {
    years--;
    months += 12;
  }

  const parts = [];
  if (years > 0) parts.push(`${valueSpan(years)} year${years !== 1 ? 's' : ''}`);
  if (months > 0) parts.push(`${valueSpan(months)} month${months !== 1 ? 's' : ''}`);
  if (days > 0 || parts.length === 0) parts.push(`${valueSpan(days)} day${days !== 1 ? 's' : ''}`);

  return `Haven't smoked for ${parts.join(' ')}`;
};

/**
 * Fetches and renders Cloudflare Analytics data into the terminal.
 * @param {import('./terminal.js').Terminal} terminal - The terminal instance to render output into.
 * @returns {Promise<void>}
 */
const handleAnalytics = (terminal) =>
  terminal.appendOutputLine(analyticsConnectingTemplate(), true)
    .then(() => fetch(ANALYTICS_ENDPOINT))
    .then(response => response.json())
    .then(data => {
      if (data.error) {
        return terminal.appendOutputLine(errorSpan(`Error fetching analytics: ${data.error}`), true);
      }
      return terminal.appendOutputLine(generateAnalyticsTemplate(data), true);
    })
    .catch(err => terminal.appendOutputLine(errorSpan(`Connection failed: ${err.message}`), true));

/**
 * Renders the smoke-free duration message into the terminal.
 * @param {import('./terminal.js').Terminal} terminal - The terminal instance to render output into.
 * @returns {Promise<void>}
 */
const handleSmoking = (terminal) => {
  const [day, month, year] = SMOKE_QUIT_DATE.split('.').map(Number);
  return terminal.appendOutputLine(`${sectionHeader('Smoke-Free Tracker')}\n\n${getSmokeFreeMessage(new Date(year, month - 1, day))}\n`, true);
};

/**
 * Renders the CV link and an up-to-date-ness note into the terminal.
 * @param {import('./terminal.js').Terminal} terminal - The terminal instance to render output into.
 * @returns {Promise<void>}
 */
const handleCv = (terminal) => terminal.appendOutputLine(generateCvTemplate(), true);

/**
 * Map of dynamic command names to their async handlers.
 * Each handler renders its output into the given terminal and resolves when done.
 * @type {Object<string, (terminal: import('./terminal.js').Terminal) => Promise<void>>}
 */
export const COMMAND_HANDLERS = {
  analytics: handleAnalytics,
  smoking: handleSmoking,
  cv: handleCv,
};

/**
 * Fetches a static command's content file from `commands/` and renders it into the terminal.
 * @param {import('./terminal.js').Terminal} terminal - The terminal instance to render output into.
 * @param {string} command - The command name, used to look up its content file in `COMMANDS`.
 * @returns {Promise<void>}
 */
export const handleStaticCommand = (terminal, command) =>
  fetch(`/commands/${COMMANDS[command].file}`)
    .then(response => {
      if (!response.ok) throw new Error('File not found');
      return response.text();
    })
    .then(text => terminal.appendOutputLine(text, true))
    .catch(() => terminal.appendOutputLine(errorSpan('Error loading command.'), true));

/**
 * Renders a "command not found" error message into the terminal, listing available commands.
 * @param {import('./terminal.js').Terminal} terminal - The terminal instance to render output into.
 * @param {string} command - The unrecognized command name.
 * @returns {Promise<void>}
 */
export const handleUnknownCommand = (terminal, command) =>
  terminal.appendOutputLine(generateUnknownCommandTemplate(command, COMMANDS), true);
