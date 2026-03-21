// --- CONFIGURATION ---
const PROMPT_TEXT = 'guest@oleksiisedun:~$';

const commands = {
  help: "Available commands: <br> - <strong>about</strong>: Who am I?<br> - <strong>skills</strong>: View my main skills<br> - <strong>socials</strong>: Contact info<br> - <strong>clear</strong>: Clean the terminal",
  about: "I am an AQA Engineer based in Ukraine with over a decade of experience in the software industry. Currently, I focus on military service and automating complex testing ecosystems for the sports betting industry.",
  skills: "<span class='iconify' data-icon='logos:javascript'></span> JavaScript<br><span class='iconify' data-icon='logos:typescript-icon'></span> TypeScript<br><span class='iconify' data-icon='logos:playwright'></span> Playwright<br><span class='iconify' data-icon='simple-icons:googleappsscript' style='color: #4285F4;'></span> Apps Script<br><span class='iconify' data-icon='simple-icons:googlesheets' style='color: #34A853;'></span> Google Sheets",
  socials: "<i class='fab fa-github'></i> <a href='https://github.com/oleksiisedun' target='_blank'>GitHub</a><br><i class='fab fa-linkedin'></i> <a href='https://www.linkedin.com/in/oleksiisedun/' target='_blank'>LinkedIn</a><br><i class='fab fa-instagram'></i> <a href='https://www.instagram.com/oleksiisedun/' target='_blank'>Instagram</a>",
  clear: "clear"
};

const asciiHeader = `
██╗  ██╗██╗    ████████╗██╗  ██╗███████╗██████╗ ███████╗██╗
██║  ██║██║    ╚══██╔══╝██║  ██║██╔════╝██╔══██╗██╔════╝██║
███████║██║       ██║   ███████║█████╗  ██████╔╝█████╗  ██║
██╔══██║██║       ██║   ██╔══██║██╔══╝  ██╔══██╗██╔══╝  ╚═╝
██║  ██║██║       ██║   ██║  ██║███████╗██║  ██║███████╗██╗
╚═╝  ╚═╝╚═╝       ╚═╝   ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝╚══════╝╚═╝`;

const welcomeMessage = [
  "Initializing secure connection...",
  "Loading command line...",
  "Type 'help' for a list of commands."
];

// --- TERMINAL CLASS ---
class Terminal {
  constructor() {
    this.outputDiv = document.getElementById('output');
    this.asciiDiv = document.getElementById('ascii-art');
    this.hiddenInput = document.getElementById('hidden-input');
    this.typerSpan = document.getElementById('typer');
    this.lineIndex = 0;

    this.init();
  }

  init() {
    this.loadAscii();
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

  loadAscii() {
    this.asciiDiv.textContent = asciiHeader;
    this.runStartup(welcomeMessage);
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

    // Add user input securely
    const historyLine = document.createElement('div');
    historyLine.className = 'output-line';
    historyLine.innerHTML = `<span class="prompt">${PROMPT_TEXT}</span> `;
    historyLine.appendChild(document.createTextNode(commandInput));
    this.outputDiv.appendChild(historyLine);

    if (command === 'clear') {
      this.outputDiv.innerHTML = '';
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
      }
    });

    document.addEventListener('click', () => {
      this.hiddenInput.focus();
    });
  }
}

// --- MOCHI ROBOT CLASS ---
class MochiRobot {
  constructor() {
    this.eyes = document.querySelectorAll('.eye');
    if (!this.eyes.length) return; // Prevent errors if not in DOM

    this.init();
  }

  init() {
    this.bindEvents();
    this.startBlinking();
  }

  handleMove(clientX, clientY) {
    this.eyes.forEach(eye => {
      const rect = eye.getBoundingClientRect();
      const eyeCenterX = rect.left + rect.width / 2;
      const eyeCenterY = rect.top + rect.height / 2;

      const deltaX = clientX - eyeCenterX;
      const deltaY = clientY - eyeCenterY;

      const angle = Math.atan2(deltaY, deltaX);
      const distance = Math.min(15, Math.hypot(deltaX, deltaY) / 10);

      const moveX = Math.cos(angle) * distance;
      const moveY = Math.sin(angle) * distance;

      eye.style.transform = `translate(${moveX}px, ${moveY}px)`;
    });
  }

  bindEvents() {
    // Mouse Listeners
    document.addEventListener('mousemove', (e) => {
      this.handleMove(e.clientX, e.clientY);
    });

    // Touch Listeners
    document.addEventListener('touchmove', (e) => {
      const touch = e.touches[0];
      this.handleMove(touch.clientX, touch.clientY);
    }, { passive: false });

    document.addEventListener('touchstart', (e) => {
      const touch = e.touches[0];
      this.handleMove(touch.clientX, touch.clientY);
    }, { passive: false });
  }

  triggerBlink = () => {
    this.eyes.forEach(eye => {
      eye.classList.add('blink');
      setTimeout(() => {
        eye.classList.remove('blink');
      }, 200);
    });

    const nextBlink = Math.random() * 4000 + 2000;
    setTimeout(this.triggerBlink, nextBlink);
  };

  startBlinking() {
    setTimeout(this.triggerBlink, 2000);
  }
}

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
  new Terminal();
  new MochiRobot();
});
