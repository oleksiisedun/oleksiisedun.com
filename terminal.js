import { PROMPT_TEXT, COMMANDS, welcomeMessage, TYPING_DELAY, SMOKE_QUIT_DATE } from './config.js';
import { generateAnalyticsTemplate, analyticsConnectingTemplate } from './templates.js';
import { SnakeGame } from './snake-game.js';

export class Terminal {
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

  init() {
    this.promptSpan.textContent = PROMPT_TEXT;
    this.setPromptReady(false);
    // Safety valve: show prompt even if typewriter stalls
    this._startupTimeout = setTimeout(() => this.setPromptReady(true), 30000);
    this.runStartup(welcomeMessage);
    this.bindEvents();
  }

  scrollToBottom() {
    this.terminalElement.scrollTop = this.terminalElement.scrollHeight;
  }

  setPromptReady(isReady) {
    if (isReady) {
      this.commandLine.style.display = 'flex';
      this.hiddenInput.disabled = false;
      this.hiddenInput.focus();
      // Delay slightly to allow DOM reflow for display:flex and mobile keyboard animation
      setTimeout(() => this.scrollToBottom(), 50);
    } else {
      this.commandLine.style.display = 'none';
      this.hiddenInput.disabled = true;
    }
  }

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

  appendOutputLine(content, isHTML = false, isError = false) {
    return new Promise((resolve) => {
      const line = document.createElement('div');
      line.className = 'output-line';
      if (isError) line.classList.add('error-text');

      this.outputDiv.appendChild(line);

      if (content instanceof Node) {
        line.appendChild(content);
        resolve();
      } else {
        this.typeWriter(content, line, TYPING_DELAY, resolve, isHTML);
      }
    });
  }

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
    } else if (command === 'analytics') {
      this.appendOutputLine(analyticsConnectingTemplate(), true)
        .then(() => fetch('https://analytics.oleksiisedun.workers.dev/'))
        .then(response => response.json())
        .then(data => {
          if (data.error) {
            return this.appendOutputLine(`<span class="error-text">Error fetching analytics: ${data.error}</span>`, true);
          }
          return this.appendOutputLine(generateAnalyticsTemplate(data), true);
        })
        .catch(err => {
          return this.appendOutputLine(`<span class="error-text">Connection failed: ${err.message}</span>`, true);
        })
        .finally(() => this.setPromptReady(true));
    } else if (command === 'smoke') {
      const quit = SMOKE_QUIT_DATE;
      const now = new Date();
      let years = now.getFullYear() - quit.getFullYear();
      let months = now.getMonth() - quit.getMonth();
      let days = now.getDate() - quit.getDate();
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
      this.appendOutputLine(`I haven't smoked for ${parts.join(' ')}`, false)
        .finally(() => this.setPromptReady(true));
    } else if (command === 'snake-game') {
      const game = new SnakeGame(
        this.outputDiv,
        () => this.scrollToBottom(),
        () => this.setPromptReady(true),
      );
      game.start();
    } else if (COMMANDS[command]?.file) {
      fetch(`/commands/${COMMANDS[command].file}`)
        .then(response => {
          if (!response.ok) throw new Error('File not found');
          return response.text();
        })
        .then(text => this.appendOutputLine(text, false))
        .catch(() => {
          return this.appendOutputLine(`<span class="error-text">Error loading command.</span>`, true);
        })
        .finally(() => this.setPromptReady(true));
    } else {
      this.appendOutputLine(`Command not found: ${command}. Type 'help'.`, false, true)
        .finally(() => this.setPromptReady(true));
    }
  }

  bindEvents() {
    this.hiddenInput.addEventListener('input', () => {
      this.typerSpan.textContent = this.hiddenInput.value;
      this.scrollToBottom();
    });

    this.hiddenInput.addEventListener('focus', () => {
      // Handle mobile keyboard popping up
      setTimeout(() => this.scrollToBottom(), 300);
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
  }
}
