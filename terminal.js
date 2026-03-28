import { PROMPT_TEXT, commands, welcomeMessage } from './config.js';
import { generateAnalyticsTemplate, analyticsConnectingTemplate, analyticsSpinnerTemplate } from './templates.js';

export class Terminal {
  constructor() {
    this.outputDiv = document.getElementById('output');
    this.hiddenInput = document.getElementById('hidden-input');
    this.typerSpan = document.getElementById('typer');
    this.lineIndex = 0;

    this.init();
  }

  init() {
    this.runStartup(welcomeMessage);
    this.bindEvents();
  }

  typeWriter(text, targetElement, speed, callback) {
    let i = 0;
    const type = () => {
      if (i < text.length) {
        if (targetElement.tagName === 'DIV') {
          targetElement.innerHTML += text.charAt(i);
        } else {
          targetElement.textContent += text.charAt(i);
        }
        i++;
        setTimeout(type, speed);
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
      this.typeWriter(lines[this.lineIndex], p, 20, () => {
        this.lineIndex++;
        this.runStartup(lines);
      });
    }
  }

  appendOutputLine(content, isHTML = false, isError = false) {
    const line = document.createElement('div');
    line.className = 'output-line';
    if (isError) {
      line.style.color = 'var(--error-color)';
    }

    if (isHTML) {
      line.innerHTML = content;
    } else {
      line.textContent = content;
      if (content instanceof Node) {
        line.innerHTML = '';
        line.appendChild(content);
      }
    }
    
    this.outputDiv.appendChild(line);
  }

  handleCommand(commandInput) {
    const command = commandInput.toLowerCase();

    const historyLine = document.createElement('div');
    historyLine.className = 'output-line';
    historyLine.innerHTML = `<span class="prompt">${PROMPT_TEXT}</span> `;
    historyLine.appendChild(document.createTextNode(commandInput));
    this.outputDiv.appendChild(historyLine);

    if (command === 'clear') {
      this.outputDiv.innerHTML = '';
    } else if (command === 'analytics') {
      this.appendOutputLine(analyticsConnectingTemplate(), true);
      
      const spinnerId = 'spinner-' + Date.now();
      this.appendOutputLine(analyticsSpinnerTemplate(spinnerId), true);
      
      this.hiddenInput.disabled = true;

      fetch('https://analytics.oleksiisedun.workers.dev/')
        .then(response => response.json())
        .then(data => {
          const spinnerElement = document.getElementById(spinnerId);
          if (spinnerElement && spinnerElement.parentElement) {
            spinnerElement.parentElement.remove();
          }

          if (data.error) {
            this.appendOutputLine(`<span style='color: var(--error-color);'>Error fetching analytics: ${data.error}</span>`, true);
          } else {
            const stats = generateAnalyticsTemplate(data);
            this.appendOutputLine(stats, true);
          }
        })
        .catch(err => {
          const spinnerElement = document.getElementById(spinnerId);
          if (spinnerElement && spinnerElement.parentElement) {
            spinnerElement.parentElement.remove();
          }
          this.appendOutputLine(`<span style='color: var(--error-color);'>Connection failed: ${err.message}</span>`, true);
        })
        .finally(() => {
          this.hiddenInput.disabled = false;
          this.hiddenInput.focus();
          window.scrollTo(0, document.body.scrollHeight);
        });
    } else if (commands[command]) {
      this.appendOutputLine(commands[command], true);
    } else if (command !== "") {
      this.appendOutputLine(`Command not found: ${command}. Type 'help'.`, false, true);
    }

    this.hiddenInput.value = '';
    this.typerSpan.textContent = '';
    window.scrollTo(0, document.body.scrollHeight);
  }

  bindEvents() {
    this.hiddenInput.addEventListener('input', () => {
      this.typerSpan.textContent = this.hiddenInput.value;
      window.scrollTo(0, document.body.scrollHeight);
    });

    this.hiddenInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const commandInput = this.hiddenInput.value.trim();
        this.handleCommand(commandInput);
      } else if (e.key === 'Tab') {
        e.preventDefault();
        const currentInput = this.hiddenInput.value.toLowerCase();
        if (currentInput) {
          const availableCommands = Object.keys(commands);
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
