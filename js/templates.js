import { CSS_CLASS } from './config.js';

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
 * Renders Cloudflare Analytics data as a terminal-style report.
 * @param {AnalyticsData} data - The analytics data to render.
 * @returns {string} HTML markup for the analytics report.
 */
export const generateAnalyticsTemplate = (data) => {
  let template = `\n<span class="${CSS_CLASS.ANALYTICS_HEADER}">[Cloudflare Analytics]</span> (Last 30 Days)\n\n`;
  template += `Unique Visitors : <span class="${CSS_CLASS.ANALYTICS_VALUE}">${data.totalVisits || 0}</span>\n`;
  template += `Page Views      : <span class="${CSS_CLASS.ANALYTICS_VALUE}">${data.totalViews || 0}</span>\n\n`;

  if (data.topCountries && data.topCountries.length > 0) {
    const maxLen = Math.max(...data.topCountries.map(c => c.country.length));
    const maxViews = Math.max(...data.topCountries.map(c => String(c.views).length));
    const separator = '-'.repeat(maxLen + maxViews + 5);
    template += `Views by Top Countries:\n`;
    template += `${separator}\n`;
    data.topCountries.forEach(c => {
      template += `${c.country.padEnd(maxLen)} | <span class="${CSS_CLASS.ANALYTICS_VALUE}">${c.views}</span>\n`;
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
  `<span class="${CSS_CLASS.ANALYTICS_HEADER}"><i class='fas fa-chart-line'></i> Connecting to Analytics Data Network...</span>`;

/**
 * Renders a list of certificates as clickable links that open their PDFs in a preview overlay.
 * @param {{ name: string, url: string }[]} certificates
 * @returns {string}
 */
export const generateCertificatesTemplate = (certificates) => {
  if (!certificates || certificates.length === 0) {
    return `\nNo certificates found.\n`;
  }

  let template = `\n<span class="${CSS_CLASS.ANALYTICS_HEADER}">[Certificates]</span>\n\n`;
  certificates.forEach(cert => {
    template += `  - <a href="${cert.url}" class="${CSS_CLASS.CERT_LINK}" data-pdf-url="${cert.url}" data-pdf-name="${cert.name}">${cert.name}</a>\n`;
  });
  template += `\n`;
  return template;
};
