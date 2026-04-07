export const generateAnalyticsTemplate = (data) => {
  let template = `\n<span style="color: var(--art-color); font-weight: bold;">[Cloudflare Analytics]</span> (Last 30 Days)\n`;
  template += `\n`;
  template += `Unique Visitors : <span style="color: #fff;">${data.totalVisits || 0}</span>\n`;
  template += `Page Views      : <span style="color: #fff;">${data.totalViews || 0}</span>\n\n`;
  
  if (data.topCountries && data.topCountries.length > 0) {
    template += `Views by Top Countries:\n`;
    template += `-----------------------\n`;
    data.topCountries.forEach(c => {
      const countryStr = c.country.padEnd(8, ' ');
      template += `${countryStr} | <span style="color: #fff;">${c.views}</span>\n`;
    });
    template += `-----------------------`;
  }
  
  template += `\n`;
  return template;
};

export const analyticsConnectingTemplate = () => `<span style='color: var(--art-color);'><i class='fas fa-chart-line'></i> Connecting to Analytics Data Network...</span>`;
