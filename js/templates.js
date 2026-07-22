import { CSS_CLASS, CV_URL, GITHUB_PROFILE_URL } from './config.js';

/**
 * @typedef {Object} CountryStat
 * @property {string} country - The country name.
 * @property {number} views - The number of views from that country.
 */

/**
 * @typedef {Object} AnalyticsData
 * @property {number} [totalVisits] - Total unique visitors.
 * @property {number} [totalViews] - Total page views.
 * @property {CountryStat[]} [topCountries] - Top countries by views.
 */

/**
 * Renders a bracketed, themed section header (e.g. `[Certificates]`).
 * @param {string} label
 * @returns {string}
 */
export const sectionHeader = (label) => `<span class="${CSS_CLASS.SECTION_HEADER}">[${label}]</span>`;

/**
 * Renders a highlighted value (e.g. a number) in the terminal's value color.
 * @param {string|number} value
 * @returns {string}
 */
export const valueSpan = (value) => `<span class="${CSS_CLASS.VALUE_TEXT}">${value}</span>`;

/**
 * Renders Cloudflare Analytics data as a terminal-style report.
 * @param {AnalyticsData} data - The analytics data to render.
 * @returns {string} HTML markup for the analytics report.
 */
export const generateAnalyticsTemplate = (data) => {
  let template = `${sectionHeader('Cloudflare Analytics')} (Last 30 Days)\n\n`;
  template += `Unique Visitors : ${valueSpan(data.totalVisits || 0)}\n`;
  template += `Page Views      : ${valueSpan(data.totalViews || 0)}\n\n`;

  if (data.topCountries && data.topCountries.length > 0) {
    const maxLen = Math.max(...data.topCountries.map(c => c.country.length));
    const maxViews = Math.max(...data.topCountries.map(c => String(c.views).length));
    const separator = '-'.repeat(maxLen + maxViews + 5);
    template += `Views by Top Countries:\n`;
    template += `${separator}\n`;
    data.topCountries.forEach(c => {
      template += `${c.country.padEnd(maxLen)} | ${valueSpan(c.views)}\n`;
    });
    template += separator;
  }

  template += `\n`;
  return template;
};

/**
 * Renders the "connecting to analytics" loading message.
 * @returns {string} HTML markup for the loading message.
 */
export const analyticsConnectingTemplate = () =>
  `<span class="${CSS_CLASS.SECTION_HEADER}"><i class='fas fa-chart-line'></i> Connecting to Analytics Data Network...</span>`;

/**
 * Renders the "loading certificates" message.
 * @returns {string} HTML markup for the loading message.
 */
export const certificatesConnectingTemplate = () =>
  `<span class="${CSS_CLASS.SECTION_HEADER}"><i class='fas fa-id-badge'></i> Loading Certificates...</span>`;

/**
 * Renders a list of certificates as clickable links that open their PDFs in a preview overlay.
 * @param {{ name: string, url: string }[]} certificates
 * @returns {string}
 */
export const generateCertificatesTemplate = (certificates) => {
  if (!certificates || certificates.length === 0) {
    return `${sectionHeader('Certificates')}\n\nNo certificates found.\n`;
  }

  let template = `${sectionHeader('Certificates')}\n\n`;
  certificates.forEach(cert => {
    template += `  - <a href="${cert.url}" data-pdf-url="${cert.url}" data-pdf-name="${cert.name}">${cert.name}</a>\n`;
  });
  template += `\n`;
  return template;
};

/**
 * Renders the CV command's output: a link to the CV plus a note pointing to GitHub for the latest work.
 * @returns {string}
 */
export const generateCvTemplate = () =>
  `${sectionHeader('CV')}\n\n` +
  `View my CV: <a href="${CV_URL}" target="_blank" rel="noopener">${CV_URL}</a>\n\n` +
  `<span class="${CSS_CLASS.NOTE_TEXT}">Note: I don't update this as often as GitHub — for my most current work, see my <a href="${GITHUB_PROFILE_URL}" target="_blank" rel="noopener">GitHub profile</a>.</span>\n`;

/**
 * Wraps a message in an error span.
 * @param {string} message
 * @returns {string}
 */
export const errorSpan = (message) => `<span class="${CSS_CLASS.ERROR_TEXT}">${message}</span>`;

/**
 * Renders a "command not found" message with a grid of available commands.
 * @param {string} command - The unrecognized command name.
 * @param {Object<string, unknown>} commands - The COMMANDS registry (keys are command names).
 * @returns {string} HTML markup for the error message.
 */
export const generateUnknownCommandTemplate = (command, commands) => {
  const names = Object.keys(commands);
  const maxLen = Math.max(...names.map(n => n.length));
  const columns = 3;

  let rows = '';
  for (let i = 0; i < names.length; i += columns) {
    rows += '  ' + names.slice(i, i + columns)
      .map(n => `<span class="${CSS_CLASS.COMMAND_TOKEN}">${n.padEnd(maxLen)}</span>`)
      .join('   ') + '\n';
  }

  return `${errorSpan(`Command not found: ${command}`)}\n\n` +
    `Available commands:\n${rows}\n` +
    `Type 'help' for more information.\n`;
};
