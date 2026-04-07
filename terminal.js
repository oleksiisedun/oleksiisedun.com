import { PROMPT_TEXT, availableCommands, welcomeMessage, TYPING_DELAY } from './config.js';
import { generateAnalyticsTemplate, analyticsConnectingTemplate, analyticsSpinnerTemplate } from './templates.js';

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
    this.runStartup(welcomeMessage);
    this.bindEvents();
  }

  setPromptReady(isReady) {
    if (isReady) {
      this.commandLine.style.display = 'flex';
      this.hiddenInput.disabled = false;
      this.hiddenInput.focus();
      this.terminalElement.scrollTop = this.terminalElement.scrollHeight;
    } else {
      this.commandLine.style.display = 'none';
      this.hiddenInput.disabled = true;
    }
  }

  typeWriter(text, targetElement, speed, callback, isHTML = false) {
    let i = 0;
    let currentOut = '';
    const type = () => {
      if (i < text.length) {
        let char = text.charAt(i);
        let skipDelay = false;

        if (isHTML && char === '<') {
          let endIndex = text.indexOf('>', i);
          if (endIndex !== -1) {
            currentOut += text.substring(i, endIndex + 1);
            i = endIndex;
            skipDelay = true;
          } else {
            currentOut += char;
          }
        } else {
          currentOut += char;
        }

        if (isHTML) {
          targetElement.innerHTML = currentOut;
        } else {
          targetElement.textContent = currentOut;
        }

        this.terminalElement.scrollTop = this.terminalElement.scrollHeight;

        i++;
        
        if (skipDelay) {
          type();
        } else {
          setTimeout(type, speed);
        }
      } else {
        if (callback) callback();
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
      this.setPromptReady(true);
    }
  }

  appendOutputLine(content, isHTML = false, isError = false) {
    return new Promise((resolve) => {
      const line = document.createElement('div');
      line.className = 'output-line';
      if (isError) {
        line.style.color = 'var(--error-color)';
      }

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
    this.terminalElement.scrollTop = this.terminalElement.scrollHeight;

    if (command === '') {
      return;
    }

    this.setPromptReady(false);

    if (command === 'clear') {
      this.outputDiv.innerHTML = '';
      this.setPromptReady(true);
    } else if (command === 'analytics') {
      let currentSpinnerId;
      this.appendOutputLine(analyticsConnectingTemplate(), true)
        .then(() => {
          currentSpinnerId = 'spinner-' + Date.now();
          return this.appendOutputLine(analyticsSpinnerTemplate(currentSpinnerId), true);
        })
        .then(() => fetch('https://analytics.oleksiisedun.workers.dev/'))
        .then(response => response.json())
        .then(data => {
          const spinnerElement = document.getElementById(currentSpinnerId);
          if (spinnerElement && spinnerElement.parentElement) {
            spinnerElement.parentElement.remove();
          }

          if (data.error) {
            return this.appendOutputLine(`<span style='color: var(--error-color);'>Error fetching analytics: ${data.error}</span>`, true);
          } else {
            const stats = generateAnalyticsTemplate(data);
            return this.appendOutputLine(stats, true);
          }
        })
        .catch(err => {
          const spinnerElement = document.getElementById(currentSpinnerId);
          if (spinnerElement && spinnerElement.parentElement) {
            spinnerElement.parentElement.remove();
          }
          return this.appendOutputLine(`<span style='color: var(--error-color);'>Connection failed: ${err.message}</span>`, true);
        })
        .finally(() => {
          this.setPromptReady(true);
        });
    } else if (availableCommands.includes(command)) {
      fetch(`/commands/${command}.txt`)
        .then(response => {
          if (!response.ok) throw new Error("File not found");
          return response.text();
        })
        .then(text => {
          return this.appendOutputLine(text, false);
        })
        .catch(err => {
          return this.appendOutputLine(`<span style='color: var(--error-color);'>Error reading command: ${err.message}</span>`, true);
        })
        .finally(() => {
          this.setPromptReady(true);
        });
    } else {
      this.appendOutputLine(`Command not found: ${command}. Type 'help'.`, false, true)
        .finally(() => {
          this.setPromptReady(true);
        });
    }
  }

  bindEvents() {
    this.hiddenInput.addEventListener('input', () => {
      this.typerSpan.textContent = this.hiddenInput.value;
      this.terminalElement.scrollTop = this.terminalElement.scrollHeight;
    });

    this.hiddenInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const commandInput = this.hiddenInput.value.trim();
        this.handleCommand(commandInput);
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
        if (currentInput) {
          const match = availableCommands.find(cmd => cmd.startsWith(currentInput));
          if (match) {
            this.hiddenInput.value = match;
            this.typerSpan.textContent = match;
          }
        }
      }
    });

    document.addEventListener('click', () => {
      this.hiddenInput.focus();
    });
  }
}
