const outputDiv = document.getElementById('output');
const asciiDiv = document.getElementById('ascii-art');
const hiddenInput = document.getElementById('hidden-input');
const typerSpan = document.getElementById('typer');

// Define commands
const commands = {
    help: "Available commands: <br> - <strong>about</strong>: Who am I?<br> - <strong>projects</strong>: View my work<br> - <strong>socials</strong>: Contact info<br> - <strong>clear</strong>: Clean the terminal",
    about: "I am an AQA Engineer based in Ukraine with over a decade of experience in the software industry. Currently, I focus on military service and automating complex testing ecosystems for the sports betting industry.",
    projects: "1. <strong>CLI-Portfolio</strong>: This website.<br>2. <strong>Project Alpha</strong>: A cool React app.<br>3. <strong>Project Beta</strong>: Python automation scripts.",
    socials: "GitHub: <a href='https://github.com/oleksiisedun' target='_blank'>@oleksiisedun</a><br>Instagram: <a href='https://www.instagram.com/oleksiisedun/' target='_blank'>@oleksiisedun</a><br>LinkedIn: <a href='https://www.linkedin.com/in/oleksiisedun/' target='_blank'>@oleksiisedun</a>",
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
    if (e.key === 'Enter') {
        const command = this.value.trim().toLowerCase();
        
        // Add command to history
        outputDiv.innerHTML += `<div class="output-line"><span class="prompt">visitor@portfolio:~$</span> ${this.value}</div>`;
        
        if (commands[command]) {
            if (command === 'clear') {
                outputDiv.innerHTML = '';
            } else {
                outputDiv.innerHTML += `<div class="output-line">${commands[command]}</div>`;
            }
        } else if (command !== "") {
            outputDiv.innerHTML += `<div class="output-line" style="color:var(--error-color)">Command not found: ${command}. Type 'help'.</div>`;
        }

        this.value = '';
        typerSpan.textContent = ''; // Clear the visible span
        window.scrollTo(0, document.body.scrollHeight);
    }
});

// Always focus hidden input
document.addEventListener('click', () => {
    hiddenInput.focus();
});

// Start
loadAscii();
