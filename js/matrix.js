import { MATRIX_CHARS, MATRIX_COLOR, MATRIX_FONT_SIZE, MATRIX_FRAME_INTERVAL_MS, MATRIX_DROP_RESET_CHANCE, MATRIX_TRIPLE_TAP_WINDOW_MS, MATRIX_HIDE_BROWSER_CHROME } from './config.js';
import { onTripleTap } from './gestures.js';

/**
 * Opens a fullscreen Matrix-style digital rain overlay in front of everything else.
 * If MATRIX_HIDE_BROWSER_CHROME is enabled, also requests the Fullscreen API to hide
 * the mobile browser's address bar/toolbar where supported (Android Chrome); iOS Safari
 * doesn't support fullscreening an arbitrary element, so this is a no-op there
 * (installed-PWA mode already hides browser chrome regardless of platform).
 * Closes on triple-tap anywhere on the overlay, or Escape key.
 * @returns {void}
 */
export const openMatrixRain = () => {
  const overlay = document.createElement('div');
  overlay.className = 'matrix-overlay';

  const canvas = document.createElement('canvas');
  overlay.appendChild(canvas);
  document.body.appendChild(overlay);
  if (MATRIX_HIDE_BROWSER_CHROME) overlay.requestFullscreen?.().catch(() => {});

  const ctx = canvas.getContext('2d');
  let drops = [];

  const resize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const columns = Math.floor(canvas.width / MATRIX_FONT_SIZE);
    drops = Array.from({ length: columns }, () => Math.floor(Math.random() * -canvas.height / MATRIX_FONT_SIZE));
  };
  resize();

  const draw = () => {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = MATRIX_COLOR;
    ctx.font = `${MATRIX_FONT_SIZE}px monospace`;

    drops.forEach((y, i) => {
      const char = MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)];
      ctx.fillText(char, i * MATRIX_FONT_SIZE, y * MATRIX_FONT_SIZE);

      if (y * MATRIX_FONT_SIZE > canvas.height && Math.random() > MATRIX_DROP_RESET_CHANCE) {
        drops[i] = 0;
      } else {
        drops[i] = y + 1;
      }
    });
  };

  const intervalId = setInterval(draw, MATRIX_FRAME_INTERVAL_MS);
  window.addEventListener('resize', resize);

  const close = () => {
    clearInterval(intervalId);
    window.removeEventListener('resize', resize);
    document.removeEventListener('keydown', onKeydown);
    unbindTripleTap();
    if (document.fullscreenElement === overlay) document.exitFullscreen?.().catch(() => {});
    overlay.remove();
  };

  const onKeydown = (e) => {
    if (e.key === 'Escape') close();
  };
  document.addEventListener('keydown', onKeydown);

  const unbindTripleTap = onTripleTap(overlay, close, MATRIX_TRIPLE_TAP_WINDOW_MS);
};
