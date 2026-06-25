import { PROMPT_TEXT, COMMANDS, welcomeMessage, TYPING_DELAY, STARTUP_FALLBACK_TIMEOUT, SCROLL_REFLOW_DELAY, MOBILE_KEYBOARD_DELAY, CSS_CLASS } from './config.js';
import { COMMAND_HANDLERS, handleStaticCommand, handleUnknownCommand } from './handlers.js';
import { openPdfPreview } from './pdf-viewer.js';

export class Terminal {
  /**
   * Sets up DOM references and starts the boot sequence.
   */
  constructor() {
    this.outputDiv = document.getElementById('output');
    this.hiddenInput = document.getElementById('hidden-input');
    this.typerSpan = document.getElementById('typer');
    this.promptSpan = document.querySelector('.command-line .prompt');
    this.commandLine = document.querySelector('.command-line');
    this.terminalElement = document.getElementById('terminal');
    this.lineIndex = 0;
    this.commandHistory = [];
    this.historyIndex = 0;

    this.init();
  }

  /**
   * Renders the prompt, runs the startup typewriter sequence, and binds input events.
   * @returns {void}
   */
  init() {
    this.promptSpan.textContent = PROMPT_TEXT;
    this.setPromptReady(false);
    // Safety valve: show prompt even if typewriter stalls
    this._startupTimeout = setTimeout(() => this.setPromptReady(true), STARTUP_FALLBACK_TIMEOUT);
    this.runStartup(welcomeMessage);
    this.bindEvents();
  }

  /**
   * Scrolls the terminal output to the bottom.
   * @returns {void}
   */
  scrollToBottom() {
    this.terminalElement.scrollTop = this.terminalElement.scrollHeight;
  }

  /**
   * Shows or hides the command prompt and toggles the hidden input accordingly.
   * @param {boolean} isReady - Whether the prompt should be shown and accept input.
   * @returns {void}
   */
  setPromptReady(isReady) {
    if (isReady) {
      this.commandLine.style.display = 'flex';
      this.hiddenInput.disabled = false;
      this.hiddenInput.focus();
      // Delay slightly to allow DOM reflow for display:flex and mobile keyboard animation
      setTimeout(() => this.scrollToBottom(), SCROLL_REFLOW_DELAY);
    } else {
      this.commandLine.style.display = 'none';
      this.hiddenInput.disabled = true;
    }
  }

  /**
   * Animates text into `targetElement` one character at a time.
   * When `isHTML` is true, the text is tokenized so HTML tags are inserted
   * instantly while visible characters are still typed one by one.
   * @param {string} text - The text (plain or HTML) to type out.
   * @param {Element} targetElement - The element to type into.
   * @param {number} speed - Delay in ms between each typed character.
   * @param {() => void} [callback] - Called once typing finishes.
   * @param {boolean} [isHTML=false] - Whether `text` contains HTML markup.
   * @returns {void}
   */
  typeWriter(text, targetElement, speed, callback, isHTML = false) {
    if (!isHTML) {
      let i = 0;
      const type = () => {
        if (i < text.length) {
          targetElement.textContent += text.charAt(i++);
          this.scrollToBottom();
          setTimeout(type, speed);
        } else if (callback) callback();
      };
      type();
      return;
    }

    // Tokenize HTML into tags and plain-text segments so tags are added
    // instantly while visible characters are typed one by one
    const tokens = [];
    const regex = /(<[^>]*>|[^<]+)/g;
    let m;
    while ((m = regex.exec(text)) !== null) tokens.push(m[0]);

    let ti = 0, ci = 0;
    let currentOut = '';

    const type = () => {
      if (ti >= tokens.length) {
        if (callback) callback();
        return;
      }
      const token = tokens[ti];
      if (token.startsWith('<')) {
        currentOut += token;
        targetElement.innerHTML = currentOut;
        this.scrollToBottom();
        ti++;
        setTimeout(type, 0);
      } else {
        if (ci < token.length) {
          currentOut += token.charAt(ci++);
          targetElement.innerHTML = currentOut;
          this.scrollToBottom();
          setTimeout(type, speed);
        } else {
          ci = 0;
          ti++;
          type();
        }
      }
    };
    type();
  }

  /**
   * Types out the startup message lines sequentially, then reveals the prompt.
   * @param {string[]} lines - The lines of HTML to type out, in order.
   * @returns {void}
   */
  runStartup(lines) {
    if (this.lineIndex < lines.length) {
      const p = document.createElement('div');
      p.className = 'output-line';
      this.outputDiv.appendChild(p);
      this.typeWriter(lines[this.lineIndex], p, TYPING_DELAY, () => {
        this.lineIndex++;
        this.runStartup(lines);
      }, true);
    } else {
      clearTimeout(this._startupTimeout);
      this.setPromptReady(true);
    }
  }

  /**
   * Appends a new output line to the terminal, typing it out unless `content` is a DOM node.
   * @param {string|Node} content - The text/HTML to type out, or a DOM node to insert directly.
   * @param {boolean} [isHTML=false] - Whether `content` is HTML markup (ignored if `content` is a Node).
   * @param {boolean} [isError=false] - Whether to style the line as an error.
   * @returns {Promise<void>} Resolves once the content has been fully added.
   */
  appendOutputLine(content, isHTML = false, isError = false) {
    return new Promise((resolve) => {
      const line = document.createElement('div');
      line.className = 'output-line';
      if (isError) line.classList.add(CSS_CLASS.ERROR_TEXT);

      this.outputDiv.appendChild(line);

      if (content instanceof Node) {
        line.appendChild(content);
        resolve();
      } else {
        this.typeWriter(content, line, TYPING_DELAY, resolve, isHTML);
      }
    });
  }

  /**
   * Processes a submitted command: records it in history, echoes it to the output,
   * and dispatches to the matching handler.
   * @param {string} commandInput - The raw command text entered by the user.
   * @returns {void}
   */
  handleCommand(commandInput) {
    if (commandInput.trim() !== '') {
      this.commandHistory.push(commandInput);
    }
    this.historyIndex = this.commandHistory.length;

    const command = commandInput.toLowerCase();

    const historyLine = document.createElement('div');
    historyLine.className = 'output-line';
    historyLine.innerHTML = `<span class="prompt">${PROMPT_TEXT}</span> `;
    historyLine.appendChild(document.createTextNode(commandInput));
    this.outputDiv.appendChild(historyLine);

    this.hiddenInput.value = '';
    this.typerSpan.textContent = '';
    this.scrollToBottom();

    if (command === '') return;

    this.setPromptReady(false);

    if (command === 'clear') {
      this.outputDiv.innerHTML = '';
      this.setPromptReady(true);
    } else if (COMMAND_HANDLERS[command]) {
      COMMAND_HANDLERS[command](this).finally(() => this.setPromptReady(true));
    } else if (COMMANDS[command]?.file) {
      handleStaticCommand(this, command).finally(() => this.setPromptReady(true));
    } else {
      handleUnknownCommand(this, command).finally(() => this.setPromptReady(true));
    }
  }

  /**
   * Wires up keyboard, focus, and click handlers for the hidden input.
   * @returns {void}
   */
  bindEvents() {
    this.hiddenInput.addEventListener('input', () => {
      this.typerSpan.textContent = this.hiddenInput.value;
      this.scrollToBottom();
    });

    this.hiddenInput.addEventListener('focus', () => {
      // Handle mobile keyboard popping up
      setTimeout(() => this.scrollToBottom(), MOBILE_KEYBOARD_DELAY);
    });

    this.hiddenInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        this.handleCommand(this.hiddenInput.value.trim());
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (this.historyIndex > 0) {
          this.historyIndex--;
          this.hiddenInput.value = this.commandHistory[this.historyIndex];
          this.typerSpan.textContent = this.commandHistory[this.historyIndex];
        }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (this.historyIndex < this.commandHistory.length - 1) {
          this.historyIndex++;
          this.hiddenInput.value = this.commandHistory[this.historyIndex];
          this.typerSpan.textContent = this.commandHistory[this.historyIndex];
        } else if (this.historyIndex === this.commandHistory.length - 1) {
          this.historyIndex++;
          this.hiddenInput.value = '';
          this.typerSpan.textContent = '';
        }
      } else if (e.key === 'Tab') {
        e.preventDefault();
        const currentInput = this.hiddenInput.value.toLowerCase();
        if (!currentInput) return;
        const matches = Object.keys(COMMANDS).filter(cmd => cmd.startsWith(currentInput));
        if (matches.length === 1) {
          this.hiddenInput.value = matches[0];
          this.typerSpan.textContent = matches[0];
        } else if (matches.length > 1) {
          const hint = document.createElement('div');
          hint.className = 'output-line';
          hint.textContent = matches.join('   ');
          this.outputDiv.appendChild(hint);
          this.scrollToBottom();
        }
      }
    });

    document.addEventListener('click', () => this.hiddenInput.focus());

    this.outputDiv.addEventListener('click', (e) => {
      const link = e.target.closest('[data-pdf-url]');
      if (!link) return;
      if (window.matchMedia('(hover: none) and (pointer: coarse)').matches) return;
      e.preventDefault();
      openPdfPreview(link.dataset.pdfUrl, link.dataset.pdfName);
    });
  }
}
