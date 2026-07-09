import { ANALYTICS_ENDPOINT, CERTIFICATES_API_URL, COMMANDS, SMOKE_QUIT_DATE } from './config.js';
import { analyticsConnectingTemplate, certificatesConnectingTemplate, errorSpan, generateAnalyticsTemplate, generateCertificatesTemplate, generateUnknownCommandTemplate, sectionHeader } from './templates.js';

/**
 * Builds the "Haven't smoked for ..." message based on the time elapsed since the quit date.
 * @param {Date} quitDate - The date smoking was quit.
 * @returns {string} A human-readable elapsed-time message.
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
  if (years > 0) parts.push(`${years} year${years !== 1 ? 's' : ''}`);
  if (months > 0) parts.push(`${months} month${months !== 1 ? 's' : ''}`);
  if (days > 0 || parts.length === 0) parts.push(`${days} day${days !== 1 ? 's' : ''}`);

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
const handleSmoking = (terminal) =>
  terminal.appendOutputLine(`${sectionHeader('Smoke-Free Tracker')}\n\n${getSmokeFreeMessage(SMOKE_QUIT_DATE)}\n`, true);

/**
 * Fetches the list of certificate PDFs from GitHub and renders them as links.
 * @param {import('./terminal.js').Terminal} terminal - The terminal instance to render output into.
 * @returns {Promise<void>}
 */
const handleCertificates = (terminal) =>
  terminal.appendOutputLine(certificatesConnectingTemplate(), true)
    .then(() => fetch(CERTIFICATES_API_URL))
    .then(response => {
      if (!response.ok) throw new Error('Failed to list certificates');
      return response.json();
    })
    .then(files => {
      const certificates = files
        .filter(f => f.type === 'file' && f.name.toLowerCase().endsWith('.pdf'))
        .map(f => ({ name: f.name.replace(/\.pdf$/i, ''), url: f.download_url }));
      return terminal.appendOutputLine(generateCertificatesTemplate(certificates), true);
    })
    .catch(() => terminal.appendOutputLine(errorSpan('Error loading certificates.'), true));

/**
 * Map of dynamic command names to their async handlers.
 * Each handler renders its output into the given terminal and resolves when done.
 * @type {Object<string, (terminal: import('./terminal.js').Terminal) => Promise<void>>}
 */
export const COMMAND_HANDLERS = {
  analytics: handleAnalytics,
  smoking: handleSmoking,
  certificates: handleCertificates,
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
