const panels = [...document.querySelectorAll('[data-panel]')];
const railButtons = [...document.querySelectorAll('.phase-rail [data-go]')];
const allGoButtons = [...document.querySelectorAll('[data-go]')];
const progress = document.querySelector('[data-progress]');
const currentReadout = document.querySelector('[data-current]');
const phaseReadout = document.querySelector('[data-phase-readout]');
const commandDialog = document.querySelector('[data-command-dialog]');
const commandOpen = document.querySelector('[data-command-open]');
const commandClose = document.querySelector('[data-command-close]');
const cursorDot = document.querySelector('[data-cursor-dot]');
const cursorRing = document.querySelector('[data-cursor-ring]');
const terminalDialog = document.querySelector('[data-terminal-dialog]');
const terminalInput = document.querySelector('[data-shell-input]');
const terminalForm = document.querySelector('[data-shell-form]');
const terminalOutput = document.querySelector('[data-shell-output]');
const terminalPrompt = document.querySelector('[data-shell-prompt]');
const shellAuth = document.querySelector('[data-shell-auth]');
const operationLabel = document.querySelector('[data-operation-label]');
const operationState = document.querySelector('[data-operation-state]');

let currentIndex = 0;
let isTransitioning = false;
let wheelAccumulator = 0;
let wheelTimer;
let touchStartY = 0;
let cursorX = -100;
let cursorY = -100;
let ringX = -100;
let ringY = -100;
let isRoot = false;
let awaitingPassword = false;
let commandHistory = [];
let historyIndex = 0;
let typedBackdoor = '';
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const commandNames = ['help', 'whoami', 'status', 'ls', 'cat', 'scan', 'hint', 'sudo -s', 'theme', 'glitch', 'breach', 'restore', 'goto', 'download', 'clear', 'exit'];
const sectionMap = { recon: 0, origin: 1, arsenal: 2, operations: 3, credentials: 4, handshake: 5, contact: 5 };
const guestFiles = {
  'about.txt': 'Jonathan Buford // Detroit, MI\nCybersecurity graduate. Seven years of professional security experience.\nObjective: bring disciplined observation, reporting, and risk thinking to a cyber team.',
  'skills.txt': 'vulnerability_assessment  networking  linux  cloud_basics\npenetration_testing_basics  incident_response  risk_management  access_control',
  'operations.log': '[COMPLETE] Attack Surface & Vulnerability Review\n[COMPLETE] Security Event Triage\n[COMPLETE] Network Defense Validation\nNote: controlled training scenarios; no production client claims.',
  'contact.enc': 'Cipher recognized. Try: cat contact.enc --decrypt',
  'classified.enc': 'AES-256 payload detected. ROOT privilege required.'
};

function addShellLine(text = '', className = '') {
  const line = document.createElement('p');
  line.className = className;
  line.textContent = text;
  terminalOutput.appendChild(line);
  terminalOutput.scrollTop = terminalOutput.scrollHeight;
  return line;
}

function addShellTable(rows) {
  rows.forEach(([key, value]) => {
    const line = document.createElement('p');
    line.className = 'shell-table';
    const label = document.createElement('b');
    label.textContent = key;
    line.append(label, document.createTextNode(value));
    terminalOutput.appendChild(line);
  });
  terminalOutput.scrollTop = terminalOutput.scrollHeight;
}

function openTerminal() {
  if (commandDialog.open) closeCommand();
  if (!terminalDialog.open) terminalDialog.showModal();
  window.setTimeout(() => terminalInput.focus(), 40);
}

function closeTerminal() {
  if (terminalDialog.open) terminalDialog.close();
}

function setRootAccess() {
  isRoot = true;
  awaitingPassword = false;
  terminalInput.type = 'text';
  terminalPrompt.textContent = 'root@jbuford:/#';
  shellAuth.textContent = 'ROOT';
  addShellLine('Privilege escalation successful. Classified filesystem mounted.', 'shell-success');
  addShellLine('New commands unlocked: breach, glitch, theme.', 'shell-dim');
}

function restoreSite() {
  document.body.classList.remove('is-breached', 'glitch-max', 'theme-ghost', 'theme-amber');
  operationLabel.textContent = 'OPERATION: CAREER_ENTRY';
  operationState.textContent = 'LIVE';
}

function runCommand(rawCommand) {
  const command = rawCommand.trim();
  if (!command) return;

  if (awaitingPassword) {
    addShellLine('••••••••••••', 'shell-command');
    if (command.toLowerCase() === 'jonathan2026') setRootAccess();
    else {
      awaitingPassword = false;
      terminalInput.type = 'text';
      terminalPrompt.textContent = 'guest@jbuford:~$';
      addShellLine('sudo: authentication failure', 'shell-error');
    }
    return;
  }

  addShellLine(command, `shell-command${isRoot ? ' is-root' : ''}`);

  const [base = '', ...args] = command.split(/\s+/);
  const action = base.toLowerCase();
  const target = args.join(' ').toLowerCase();

  switch (action) {
    case 'help':
      addShellLine('AVAILABLE COMMANDS', 'shell-success');
      addShellTable([
        ['help', 'show this command index'], ['whoami', 'display active identity'], ['status', 'inspect operator status'],
        ['ls', 'enumerate exposed files'], ['cat <file>', 'read a file'], ['scan', 'probe the portfolio host'],
        ['hint', 'request an escalation clue'], ['sudo -s', 'attempt privilege escalation'], ['theme <name>', 'crimson | ghost | amber'],
        ['glitch <on|off>', 'alter display integrity (root)'], ['breach', 'take control of the interface (root)'],
        ['restore', 'return the interface to baseline'], ['goto <phase>', 'jump to a dossier phase'],
        ['download resume', 'extract the résumé'], ['clear', 'clear terminal output'], ['exit', 'close the shell']
      ]);
      break;
    case 'whoami':
      addShellLine(isRoot ? 'root // authorization: UNRESTRICTED' : 'guest // authorization: RECON_ONLY', 'shell-success');
      break;
    case 'status':
      addShellTable([
        ['SUBJECT', 'Jonathan Buford'], ['LOCATION', 'Detroit, Michigan'], ['EDUCATION', 'DSDT College // Diploma granted Feb 2026'],
        ['CLEARANCE', 'Secret'], ['CAREER STATUS', 'Available for cybersecurity opportunities'], ['SHELL', isRoot ? 'ROOT' : 'GUEST']
      ]);
      break;
    case 'ls':
      addShellLine(`about.txt  skills.txt  operations.log  contact.enc  classified.${isRoot ? 'txt' : 'enc'}`);
      break;
    case 'cat': {
      if (!target) { addShellLine('cat: missing file operand', 'shell-error'); break; }
      if (target === 'contact.enc --decrypt' || target === 'contact.enc -d') {
        addShellLine('DECRYPTED CONTACT VECTOR', 'shell-success');
        addShellLine('EMAIL: jpbuford30@yahoo.com\nVOICE: 313.209.1550');
      } else if (target === 'classified.txt' && isRoot) {
        addShellLine('CLASSIFIED // RECRUITER EYES ONLY', 'shell-warning');
        addShellLine('Operator note: Jonathan’s advantage is the bridge between physical and cyber security. He already understands vigilance, chain-of-command escalation, policy enforcement, evidence-quality reporting, and staying composed when conditions change. The technical layer is new; the security mindset is not.');
        addShellLine('Recommended deployment: entry-level SOC, vulnerability management, or offensive-security support role.', 'shell-success');
      } else if (target.startsWith('classified')) {
        addShellLine('ACCESS DENIED: root authorization required. Try `hint`.', 'shell-error');
      } else if (guestFiles[target]) addShellLine(guestFiles[target]);
      else addShellLine(`cat: ${target}: No such file`, 'shell-error');
      break;
    }
    case 'scan':
      addShellLine('Scanning jbuford.local [##########] 100%', 'shell-success');
      addShellTable([['313/tcp', 'OPEN  contact-channel'], ['2026/tcp', 'OPEN  cyber-diploma'], ['7/yrs', 'OPEN  professional-security'], ['ROOT', isRoot ? 'COMPROMISED' : 'FILTERED']]);
      break;
    case 'hint':
      addShellLine('ESCALATION CLUE: combine the subject’s first name with the four-digit diploma year. Lowercase. No spaces.', 'shell-warning');
      break;
    case 'sudo':
      if (target !== '-s') { addShellLine('usage: sudo -s', 'shell-error'); break; }
      if (isRoot) { addShellLine('Already operating as root.'); break; }
      awaitingPassword = true;
      terminalInput.type = 'password';
      terminalPrompt.textContent = '[sudo] password:';
      addShellLine('Privilege escalation requested.', 'shell-warning');
      break;
    case 'theme':
      if (!['crimson', 'ghost', 'amber'].includes(target)) { addShellLine('theme: choose crimson, ghost, or amber', 'shell-error'); break; }
      document.body.classList.remove('theme-ghost', 'theme-amber');
      if (target !== 'crimson') document.body.classList.add(`theme-${target}`);
      addShellLine(`Visual payload applied: ${target.toUpperCase()}`, 'shell-success');
      break;
    case 'glitch':
      if (!isRoot) { addShellLine('ACCESS DENIED: root authorization required.', 'shell-error'); break; }
      if (!['on', 'off'].includes(target)) { addShellLine('usage: glitch <on|off>', 'shell-error'); break; }
      document.body.classList.toggle('glitch-max', target === 'on');
      addShellLine(`Display integrity override: ${target.toUpperCase()}`, 'shell-success');
      break;
    case 'breach':
      if (!isRoot) { addShellLine('EXPLOIT FAILED: root authorization required.', 'shell-error'); break; }
      document.body.classList.add('is-breached');
      operationLabel.textContent = 'OPERATION: SITE_TAKEOVER';
      operationState.textContent = 'PWNED';
      addShellLine('Payload delivered. Interface control acquired.', 'shell-success');
      addShellLine('The site is now “compromised.” No actual systems were harmed.', 'shell-dim');
      break;
    case 'restore':
    case 'reboot':
      restoreSite();
      addShellLine('Baseline configuration restored.', 'shell-success');
      break;
    case 'goto':
      if (!(target in sectionMap)) { addShellLine('Unknown phase. Use: recon, origin, arsenal, operations, credentials, handshake', 'shell-error'); break; }
      closeTerminal();
      window.setTimeout(() => setPanel(sectionMap[target], sectionMap[target] > currentIndex ? 1 : -1), 80);
      break;
    case 'download':
      if (target !== 'resume' && target !== 'résumé') { addShellLine('download: payload not found', 'shell-error'); break; }
      addShellLine('Extracting resume payload...', 'shell-success');
      window.setTimeout(() => {
        const link = document.createElement('a');
        link.href = 'assets/May Resumes Jonathan Buford.pdf';
        link.download = 'Jonathan Buford Resume.pdf';
        link.click();
      }, 250);
      break;
    case 'clear':
      terminalOutput.replaceChildren();
      break;
    case 'exit':
    case 'logout':
      closeTerminal();
      break;
    case 'echo':
      addShellLine(args.join(' '));
      break;
    default:
      addShellLine(`${action}: command not found. Type "help".`, 'shell-error');
  }
}

function setPanel(nextIndex, direction = 1) {
  const boundedIndex = Math.max(0, Math.min(panels.length - 1, nextIndex));
  if (boundedIndex === currentIndex || isTransitioning) return;

  isTransitioning = true;
  const previous = panels[currentIndex];
  const next = panels[boundedIndex];
  const reversing = direction < 0;

  panels.forEach((panel) => panel.classList.toggle('is-reversing', reversing));
  previous.classList.remove('is-active');
  previous.classList.add('was-active');
  previous.setAttribute('aria-hidden', 'true');
  next.classList.remove('was-active');
  next.classList.add('is-active');
  next.removeAttribute('aria-hidden');

  currentIndex = boundedIndex;
  railButtons.forEach((button, index) => {
    button.classList.toggle('is-active', index === currentIndex);
    if (index === currentIndex) button.setAttribute('aria-current', 'step');
    else button.removeAttribute('aria-current');
  });

  progress.style.width = `${((currentIndex + 1) / panels.length) * 100}%`;
  currentReadout.textContent = String(currentIndex + 1).padStart(2, '0');
  phaseReadout.textContent = next.dataset.phase;
  history.replaceState(null, '', `#${next.id}`);

  window.setTimeout(() => {
    panels.forEach((panel) => {
      if (panel !== next) panel.classList.remove('was-active');
    });
    isTransitioning = false;
  }, reduceMotion ? 20 : 900);
}

function canScrollPanel(panel, direction) {
  if (!panel || panel.scrollHeight <= panel.clientHeight + 2) return false;
  if (direction > 0) return panel.scrollTop + panel.clientHeight < panel.scrollHeight - 2;
  return panel.scrollTop > 2;
}

window.addEventListener('wheel', (event) => {
  if (commandDialog.open || terminalDialog.open || isTransitioning) return;
  const activePanel = panels[currentIndex];
  if (canScrollPanel(activePanel, Math.sign(event.deltaY))) return;
  event.preventDefault();
  wheelAccumulator += event.deltaY;
  clearTimeout(wheelTimer);
  wheelTimer = window.setTimeout(() => { wheelAccumulator = 0; }, 180);
  if (Math.abs(wheelAccumulator) < 42) return;
  const direction = wheelAccumulator > 0 ? 1 : -1;
  wheelAccumulator = 0;
  setPanel(currentIndex + direction, direction);
}, { passive: false });

window.addEventListener('touchstart', (event) => {
  touchStartY = event.changedTouches[0].clientY;
}, { passive: true });

window.addEventListener('touchend', (event) => {
  if (commandDialog.open || terminalDialog.open || isTransitioning) return;
  const delta = touchStartY - event.changedTouches[0].clientY;
  if (Math.abs(delta) < 48) return;
  const direction = delta > 0 ? 1 : -1;
  if (canScrollPanel(panels[currentIndex], direction)) return;
  setPanel(currentIndex + direction, direction);
}, { passive: true });

allGoButtons.forEach((button) => {
  button.addEventListener('click', (event) => {
    event.preventDefault();
    const destination = Number(button.dataset.go);
    setPanel(destination, destination > currentIndex ? 1 : -1);
  });
});

function openCommand() {
  if (terminalDialog.open) closeTerminal();
  if (!commandDialog.open) commandDialog.showModal();
}

function closeCommand() {
  if (commandDialog.open) commandDialog.close();
}

commandOpen.addEventListener('click', openCommand);
commandClose.addEventListener('click', closeCommand);
commandDialog.addEventListener('click', (event) => {
  if (event.target === commandDialog) closeCommand();
});

document.querySelectorAll('[data-command-go]').forEach((button) => {
  button.addEventListener('click', () => {
    const destination = Number(button.dataset.commandGo);
    closeCommand();
    window.setTimeout(() => setPanel(destination, destination > currentIndex ? 1 : -1), 50);
  });
});

document.querySelectorAll('[data-terminal-trigger]').forEach((trigger) => {
  trigger.addEventListener('click', openTerminal);
});

document.querySelector('[data-terminal-close]').addEventListener('click', closeTerminal);
terminalDialog.addEventListener('click', (event) => {
  if (event.target === terminalDialog) closeTerminal();
});

terminalForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const command = terminalInput.value;
  if (!awaitingPassword && command.trim()) {
    commandHistory.push(command.trim());
    historyIndex = commandHistory.length;
  }
  terminalInput.value = '';
  runCommand(command);
});

terminalInput.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowUp') {
    event.preventDefault();
    if (!commandHistory.length || awaitingPassword) return;
    historyIndex = Math.max(0, historyIndex - 1);
    terminalInput.value = commandHistory[historyIndex] || '';
  }
  if (event.key === 'ArrowDown') {
    event.preventDefault();
    if (awaitingPassword) return;
    historyIndex = Math.min(commandHistory.length, historyIndex + 1);
    terminalInput.value = commandHistory[historyIndex] || '';
  }
  if (event.key === 'Tab') {
    event.preventDefault();
    if (awaitingPassword) return;
    const value = terminalInput.value.toLowerCase();
    const matches = commandNames.filter((name) => name.startsWith(value));
    if (matches.length === 1) terminalInput.value = matches[0];
    else if (matches.length > 1) addShellLine(matches.join('    '), 'shell-dim');
  }
  if (event.ctrlKey && event.key.toLowerCase() === 'l') {
    event.preventDefault();
    terminalOutput.replaceChildren();
  }
});

window.addEventListener('keydown', (event) => {
  if (event.ctrlKey && event.key === '`') {
    event.preventDefault();
    if (terminalDialog.open) closeTerminal();
    else openTerminal();
    return;
  }

  if (terminalDialog.open) return;

  if (event.key === '/' && !commandDialog.open) {
    event.preventDefault();
    openCommand();
    return;
  }

  if (commandDialog.open) {
    const number = Number(event.key);
    if (number >= 1 && number <= panels.length) {
      closeCommand();
      window.setTimeout(() => setPanel(number - 1, number - 1 > currentIndex ? 1 : -1), 50);
    }
    return;
  }

  if (['ArrowDown', 'PageDown', ' '].includes(event.key)) {
    event.preventDefault();
    setPanel(currentIndex + 1, 1);
  }
  if (['ArrowUp', 'PageUp'].includes(event.key)) {
    event.preventDefault();
    setPanel(currentIndex - 1, -1);
  }
  if (event.key === 'Home') setPanel(0, -1);
  if (event.key === 'End') setPanel(panels.length - 1, 1);

  if (!event.ctrlKey && !event.metaKey && !event.altKey && event.key.length === 1) {
    typedBackdoor = `${typedBackdoor}${event.key.toLowerCase()}`.slice(-6);
    if (typedBackdoor === 'breach') {
      openTerminal();
      addShellLine('Knock sequence accepted. Backdoor channel opened.', 'shell-success');
      typedBackdoor = '';
    }
  }
});

if (window.matchMedia('(pointer: fine)').matches) {
  window.addEventListener('mousemove', (event) => {
    cursorX = event.clientX;
    cursorY = event.clientY;
    cursorDot.style.transform = `translate(${cursorX}px, ${cursorY}px) translate(-50%, -50%)`;
  });

  function animateCursor() {
    ringX += (cursorX - ringX) * 0.14;
    ringY += (cursorY - ringY) * 0.14;
    cursorRing.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;
    requestAnimationFrame(animateCursor);
  }
  animateCursor();

  document.querySelectorAll('a, button').forEach((interactive) => {
    interactive.addEventListener('mouseenter', () => document.body.classList.add('is-hovering'));
    interactive.addEventListener('mouseleave', () => document.body.classList.remove('is-hovering'));
  });
}

const hashIndex = panels.findIndex((panel) => `#${panel.id}` === window.location.hash);
if (hashIndex > 0) {
  const initialPanel = panels[0];
  initialPanel.classList.remove('is-active');
  initialPanel.setAttribute('aria-hidden', 'true');
  panels[hashIndex].classList.add('is-active');
  panels[hashIndex].removeAttribute('aria-hidden');
  currentIndex = hashIndex;
}

railButtons.forEach((button, index) => button.classList.toggle('is-active', index === currentIndex));
progress.style.width = `${((currentIndex + 1) / panels.length) * 100}%`;
currentReadout.textContent = String(currentIndex + 1).padStart(2, '0');
phaseReadout.textContent = panels[currentIndex].dataset.phase;
