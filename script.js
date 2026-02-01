const outputDiv = document.getElementById('output');
const asciiDiv = document.getElementById('ascii-art');
const hiddenInput = document.getElementById('hidden-input');
const typerSpan = document.getElementById('typer');

const PROMPT_TEXT = 'guest@oleksiisedun:~$';

// Define commands
const commands = {
    help: "Available commands: <br> - <strong>about</strong>: Who am I?<br> - <strong>skills</strong>: View my main skills<br> - <strong>socials</strong>: Contact info<br> - <strong>clear</strong>: Clean the terminal",
    about: "I am an AQA Engineer based in Ukraine with over a decade of experience in the software industry. Currently, I focus on military service and automating complex testing ecosystems for the sports betting industry.",
    skills: "<span class='iconify' data-icon='logos:javascript'></span> JavaScript<br><span class='iconify' data-icon='logos:typescript-icon'></span> TypeScript<br><span class='iconify' data-icon='logos:playwright'></span> Playwright<br><span class='iconify' data-icon='simple-icons:googleappsscript' style='color: #4285F4;'></span> Apps Script<br><span class='iconify' data-icon='simple-icons:googlesheets' style='color: #34A853;'></span> Google Sheets",
    socials: "<i class='fab fa-github'></i> <a href='https://github.com/oleksiisedun' target='_blank'>GitHub</a><br><i class='fab fa-instagram'></i> <a href='https://www.instagram.com/oleksiisedun/' target='_blank'>Instagram</a><br><i class='fab fa-linkedin'></i> <a href='https://www.linkedin.com/in/oleksiisedun/' target='_blank'>LinkedIn</a>",
    clear: "clear"
};

// ASCII Art Header
const asciiHeader = `
██╗  ██╗██╗    ████████╗██╗  ██╗███████╗██████╗ ███████╗██╗
██║  ██║██║    ╚══██╔══╝██║  ██║██╔════╝██╔══██╗██╔════╝██║
███████║██║       ██║   ███████║█████╗  ██████╔╝█████╗  ██║
██╔══██║██║       ██║   ██╔══██║██╔══╝  ██╔══██╗██╔══╝  ╚═╝
██║  ██║██║       ██║   ██║  ██║███████╗██║  ██║███████╗██╗
╚═╝  ╚═╝╚═╝       ╚═╝   ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝╚══════╝╚═╝`;

// Initial welcome lines
const welcomeMessage = [
    "Initializing secure connection...",
    "Loading command line...",
    "Type 'help' for a list of commands."
];

let lineIndex = 0;

// Typewriter effect
function typeWriter(text, targetElement, speed, callback) {
    let i = 0;
    function type() {
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
    }
    type();
}

function loadAscii() {
    asciiDiv.textContent = asciiHeader;
    runStartup(welcomeMessage);
}

function runStartup(lines) {
    if (lineIndex < lines.length) {
        const p = document.createElement('div');
        p.className = 'output-line';
        outputDiv.appendChild(p);
        typeWriter(lines[lineIndex], p, 20, () => {
            lineIndex++;
            runStartup(lines);
        });
    }
}

// Sync hidden input to visible span
hiddenInput.addEventListener('input', function() {
    typerSpan.textContent = this.value;
    window.scrollTo(0, document.body.scrollHeight);
});

// Handle Enter Key
hiddenInput.addEventListener('keydown', function(e) {
    if (e.key !== 'Enter') return;

    const commandInput = this.value.trim();
    const command = commandInput.toLowerCase();

    // Add the executed command to the output history
    const historyLine = document.createElement('div');
    historyLine.className = 'output-line';
    historyLine.innerHTML = `<span class="prompt">${PROMPT_TEXT}</span> `;
    // Append user input as a text node to prevent HTML injection
    historyLine.appendChild(document.createTextNode(commandInput));
    outputDiv.appendChild(historyLine);

    if (command === 'clear') {
        outputDiv.innerHTML = '';
    } else if (commands[command]) {
        const resultLine = document.createElement('div');
        resultLine.className = 'output-line';
        resultLine.innerHTML = commands[command]; // Safe as it's from our own object
        outputDiv.appendChild(resultLine);
    } else if (command !== "") {
        const errorLine = document.createElement('div');
        errorLine.className = 'output-line';
        errorLine.style.color = 'var(--error-color)';
        errorLine.textContent = `Command not found: ${command}. Type 'help'.`;
        outputDiv.appendChild(errorLine);
    }

    this.value = '';
    typerSpan.textContent = ''; // Clear the visible span
    window.scrollTo(0, document.body.scrollHeight);
});

// Always focus hidden input
document.addEventListener('click', () => {
    hiddenInput.focus();
});

// Start
loadAscii();
