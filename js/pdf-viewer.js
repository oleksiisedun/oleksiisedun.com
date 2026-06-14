/**
 * Opens a fullscreen overlay previewing the given PDF in front of the terminal.
 * Closes on close-button click, backdrop click, or Escape key.
 * @param {string} url - URL of the PDF to preview.
 * @param {string} name - Display name shown in the overlay header.
 * @returns {void}
 */
export const openPdfPreview = (url, name) => {
  const overlay = document.createElement('div');
  overlay.className = 'pdf-overlay';

  const content = document.createElement('div');
  content.className = 'pdf-overlay-content';

  const header = document.createElement('div');
  header.className = 'pdf-overlay-header';

  const title = document.createElement('span');
  title.className = 'pdf-overlay-title';
  title.textContent = name;

  const actions = document.createElement('div');
  actions.className = 'pdf-overlay-actions';

  const openLink = document.createElement('a');
  openLink.href = url;
  openLink.target = '_blank';
  openLink.rel = 'noopener';
  openLink.title = 'Open in new tab';
  openLink.innerHTML = '<i class="fas fa-external-link-alt"></i>';

  const closeButton = document.createElement('button');
  closeButton.className = 'pdf-close-button';
  closeButton.setAttribute('aria-label', 'Close');
  closeButton.innerHTML = '&times;';

  const frame = document.createElement('iframe');
  frame.className = 'pdf-overlay-frame';
  frame.src = url;

  actions.append(openLink, closeButton);
  header.append(title, actions);
  content.append(header, frame);
  overlay.appendChild(content);
  document.body.appendChild(overlay);

  const close = () => {
    document.removeEventListener('keydown', onKeydown);
    overlay.remove();
  };

  const onKeydown = (e) => {
    if (e.key === 'Escape') close();
  };

  overlay.addEventListener('click', (e) => {
    e.stopPropagation();
    if (e.target === overlay) close();
  });
  closeButton.addEventListener('click', close);
  document.addEventListener('keydown', onKeydown);
};
