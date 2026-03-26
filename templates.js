export const generateAnalyticsTemplate = (stats) => `
  <div style="margin-top: 10px; margin-bottom: 10px; padding: 15px; border: 1px solid rgba(0, 255, 204, 0.3); border-radius: 8px; background: rgba(0, 255, 204, 0.05); font-family: var(--font-stack);">
    <div style="color: #00ffcc; font-weight: bold; margin-bottom: 15px; border-bottom: 1px solid rgba(0, 255, 204, 0.3); padding-bottom: 8px; font-size: 1.1em;">
      <i class="fab fa-google"></i> Google Analytics (Last 30 Days)
    </div>
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
      <div><i class="fas fa-users" style="color: var(--art-color); width: 20px;"></i> Unique Visitors: <strong style="color: #fff;">${stats.visitors}</strong></div>
      <div><i class="fas fa-eye" style="color: var(--prompt-color); width: 20px;"></i> Page Views: <strong style="color: #fff;">${stats.pageViews}</strong></div>
      <div><i class="fas fa-globe" style="color: #00a8ff; width: 20px;"></i> Top Region: <strong style="color: #fff;">${stats.topRegion}</strong></div>
      <div><i class="fas fa-chart-pie" style="color: #4cd137; width: 20px;"></i> Region Views: <strong style="color: #fff;">${stats.topRegionViews}</strong></div>
    </div>
    <div style="margin-top: 15px; font-size: 0.8em; color: rgba(255,255,255,0.5); text-align: right;">
      *Data provided by Cloudflare Analytics
    </div>
  </div>
`;

export const analyticsConnectingTemplate = () => `<span style='color: var(--art-color);'><i class='fas fa-chart-line'></i> Connecting to Analytics Data Network...</span>`;

export const analyticsSpinnerTemplate = (spinnerId) => `<span id="${spinnerId}" style='color: var(--text-color);'>Establishing secure connection <i class="fas fa-circle-notch fa-spin"></i></span>`;
