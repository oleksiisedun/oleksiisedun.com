import { ANALYTICS_ENDPOINT, COMMANDS, TRACKERS } from './config.js';
import {
  analyticsConnectingTemplate,
  errorSpan,
  generateAnalyticsTemplate,
  generateTrackersTemplate,
  generateUnknownCommandTemplate,
  valueSpan,
} from './templates.js';

/**
 * Parses a `DD.MM.YYYY` date string into a Date.
 * @param {string} dateStr
 * @returns {Date}
 */
const parseDate = (dateStr) => {
  const [day, month, year] = dateStr.split('.').map(Number);
  return new Date(year, month - 1, day);
};

const MS_PER_DAY = 86_400_000;

/**
 * Adds whole calendar months to a date, clamping the day to the target month's length
 * (e.g. 31 Jan + 1 month = 28 Feb, or 29 Feb in a leap year).
 * @param {Date} date
 * @param {number} months
 * @returns {Date}
 */
const addMonthsClamped = (date, months) => {
  const firstOfTarget = new Date(date.getFullYear(), date.getMonth() + months, 1);
  const daysInTarget = new Date(firstOfTarget.getFullYear(), firstOfTarget.getMonth() + 1, 0).getDate();
  return new Date(firstOfTarget.getFullYear(), firstOfTarget.getMonth(), Math.min(date.getDate(), daysInTarget));
};

/**
 * Whole days between two local calendar dates. Uses UTC components so DST shifts can't skew the count.
 * @param {Date} from
 * @param {Date} to
 * @returns {number}
 */
const daysBetween = (from, to) =>
  Math.round(
    (Date.UTC(to.getFullYear(), to.getMonth(), to.getDate()) -
      Date.UTC(from.getFullYear(), from.getMonth(), from.getDate())) /
      MS_PER_DAY,
  );

/**
 * Formats the time elapsed since `startDate` as a "X years Y months Z days" string.
 * Months are whole calendar months with the day clamped to month end, so a 31 Jan start reaches
 * "1 month" on 28 Feb (29 Feb in a leap year) and the day count is never negative.
 * @param {Date} startDate
 * @returns {string} HTML markup with the numeric values highlighted.
 */
export const formatElapsedDuration = (startDate) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  let totalMonths = (today.getFullYear() - startDate.getFullYear()) * 12 + today.getMonth() - startDate.getMonth();
  if (addMonthsClamped(startDate, totalMonths) > today) totalMonths--;

  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;
  const days = daysBetween(addMonthsClamped(startDate, totalMonths), today);

  const parts = [];
  if (years > 0) parts.push(`${valueSpan(years)} year${years !== 1 ? 's' : ''}`);
  if (months > 0) parts.push(`${valueSpan(months)} month${months !== 1 ? 's' : ''}`);
  if (days > 0 || parts.length === 0) parts.push(`${valueSpan(days)} day${days !== 1 ? 's' : ''}`);

  return parts.join(' ');
};

/**
 * Fetches and renders Cloudflare Analytics data into the terminal.
 * @param {import('./terminal.js').Terminal} terminal - The terminal instance to render output into.
 * @returns {Promise<void>}
 */
const handleAnalytics = (terminal) =>
  terminal
    .appendOutputLine(analyticsConnectingTemplate(), true)
    .then(() => fetch(ANALYTICS_ENDPOINT))
    .then((response) => response.json())
    .then((data) => {
      if (data.error) {
        return terminal.appendOutputLine(errorSpan(`Error fetching analytics: ${data.error}`), true);
      }
      return terminal.appendOutputLine(generateAnalyticsTemplate(data), true);
    })
    .catch((err) => terminal.appendOutputLine(errorSpan(`Connection failed: ${err.message}`), true));

/**
 * Renders all configured life trackers into the terminal.
 * @param {import('./terminal.js').Terminal} terminal - The terminal instance to render output into.
 * @returns {Promise<void>}
 */
const handleTrackers = (terminal) => {
  const trackers = TRACKERS.map(({ icon, label, prefix, date }) => ({
    icon,
    label,
    sentence: `${prefix} ${formatElapsedDuration(parseDate(date))}`,
  }));
  return terminal.appendOutputLine(generateTrackersTemplate(trackers), true);
};

/**
 * Map of dynamic command names to their async handlers.
 * Each handler renders its output into the given terminal and resolves when done.
 * @type {Record<string, (terminal: import('./terminal.js').Terminal) => Promise<void>>}
 */
export const COMMAND_HANDLERS = {
  analytics: handleAnalytics,
  trackers: handleTrackers,
};

/**
 * Fetches a static command's content file from `commands/` and renders it into the terminal.
 * @param {import('./terminal.js').Terminal} terminal - The terminal instance to render output into.
 * @param {string} command - The command name, used to look up its content file in `COMMANDS`.
 * @returns {Promise<void>}
 */
export const handleStaticCommand = (terminal, command) =>
  fetch(`/commands/${COMMANDS[command].file}`)
    .then((response) => {
      if (!response.ok) throw new Error('File not found');
      return response.text();
    })
    .then((text) => terminal.appendOutputLine(text, true))
    .catch(() => terminal.appendOutputLine(errorSpan('Error loading command.'), true));

/**
 * Renders a "command not found" error message into the terminal, listing available commands.
 * @param {import('./terminal.js').Terminal} terminal - The terminal instance to render output into.
 * @param {string} command - The unrecognized command name.
 * @returns {Promise<void>}
 */
export const handleUnknownCommand = (terminal, command) =>
  terminal.appendOutputLine(generateUnknownCommandTemplate(command, COMMANDS), true);
