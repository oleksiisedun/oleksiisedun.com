export const generateAnalyticsTemplate = (data) => {
  let template = `\n<span class="analytics-header">[Cloudflare Analytics]</span> (Last 30 Days)\n\n`;
  template += `Unique Visitors : <span class="analytics-value">${data.totalVisits || 0}</span>\n`;
  template += `Page Views      : <span class="analytics-value">${data.totalViews || 0}</span>\n\n`;

  if (data.topCountries && data.topCountries.length > 0) {
    const maxLen = Math.max(...data.topCountries.map(c => c.country.length));
    const maxViews = Math.max(...data.topCountries.map(c => String(c.views).length));
    const separator = '-'.repeat(maxLen + maxViews + 5);
    template += `Views by Top Countries:\n`;
    template += `${separator}\n`;
    data.topCountries.forEach(c => {
      template += `${c.country.padEnd(maxLen)} | <span class="analytics-value">${c.views}</span>\n`;
    });
    template += separator;
  }

  template += `\n`;
  return template;
};

export const analyticsConnectingTemplate = () =>
  `<span class="analytics-header"><i class='fas fa-chart-line'></i> Connecting to Analytics Data Network...</span>`;

/**
 * Renders a list of certificates as clickable links opening their PDFs in a new tab.
 * @param {{ name: string, url: string }[]} certificates
 * @returns {string}
 */
export const generateCertificatesTemplate = (certificates) => {
  if (!certificates || certificates.length === 0) {
    return `\nNo certificates found.\n`;
  }

  let template = `\n<span class="analytics-header">[Certificates]</span>\n\n`;
  certificates.forEach(cert => {
    template += `  - <a href="${cert.url}" target="_blank" rel="noopener">${cert.name}</a>\n`;
  });
  template += `\n`;
  return template;
};
