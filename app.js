const documentCanvas = document.getElementById('documentCanvas');
const editorPage = document.getElementById('editorPage');
const toast = document.getElementById('toast');
const imageUpload = document.getElementById('imageUpload');
const pageSizeLabel = document.getElementById('pageSizeLabel');
const themeLabel = document.getElementById('themeLabel');
const fontSizeRange = document.getElementById('fontSizeRange');
const textColorPicker = document.getElementById('textColorPicker');

const storageKey = 'pixel-documents-studio-state';

const defaultState = {
  theme: '#6d5efc',
  size: 'a4',
  content: `
    <h1>Welcome to Pixel Documents Studio</h1>
    <p>
      Design, write, shape ideas, and export polished projects with a modern
      visual workspace built for creators.
    </p>
    <div class="mini-card">
      <h3>Launch Campaign</h3>
      <p>Creative brief · content plan · brand toolkit</p>
    </div>
  `
};

function showToast(message = 'Saved') {
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 1200);
}

function setTheme(color) {
  const root = document.documentElement;
  root.style.setProperty('--primary', color);
  root.style.setProperty('--primary-soft', `${color}22`);

  const themeName = {
    '#6d5efc': 'Violet',
    '#ff5d8f': 'Pink',
    '#1ec8a5': 'Mint',
    '#f7b801': 'Gold',
    '#2b6cf6': 'Blue',
    '#fd7e14': 'Orange'
  }[color] || 'Custom';

  themeLabel.textContent = themeName;
}

function setPageSize(size) {
  const presets = {
    a4: { width: '820px', height: '1120px', label: 'A4' },
    letter: { width: '780px', height: '1010px', label: 'Letter' },
    social: { width: '720px', height: '720px', label: 'Social' },
    banner: { width: '960px', height: '520px', label: 'Banner' }
  };

  const preset = presets[size] || presets.a4;
  const page = document.querySelector('.page');

  page.style.width = preset.width;
  page.style.minHeight = preset.height;
  pageSizeLabel.textContent = preset.label;

  document.querySelectorAll('.size-btn').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.size === size);
  });
}

function applyState() {
  const state = JSON.parse(localStorage.getItem(storageKey) || '{}');
  const theme = state.theme || defaultState.theme;
  const size = state.size || defaultState.size;
  const content = state.content || defaultState.content;

  setTheme(theme);
  setPageSize(size);
  editorPage.innerHTML = content;
  document.querySelectorAll('.color-swatch').forEach((swatch) => {
    swatch.classList.toggle('active', swatch.dataset.theme === theme);
  });

  const activeColor = document.querySelector(`.color-swatch[data-theme="${theme}"]`);
  if (activeColor) {
    activeColor.classList.add('active');
  }

  if (editorPage.querySelector('h1')) {
    editorPage.focus();
  }
}

function saveState() {
  const state = {
    theme: document.documentElement.style.getPropertyValue('--primary') || defaultState.theme,
    size: document.querySelector('.size-btn.active')?.dataset.size || defaultState.size,
    content: editorPage.innerHTML
  };

  localStorage.setItem(storageKey, JSON.stringify(state));
  showToast('Saved');
}

function executeCommand(command, value = null) {
  if (command === 'bold' || command === 'italic' || command === 'underline') {
    document.execCommand(command, false, value);
    return;
  }

  if (command === 'fontSize') {
    document.execCommand('fontSize', false, value);
    return;
  }

  if (command === 'foreColor') {
    document.execCommand('foreColor', false, value);
    return;
  }
}

function addTextBlock() {
  const newText = document.createElement('p');
  newText.innerHTML = '<strong>New Text Block</strong>';
  editorPage.appendChild(newText);
  editorPage.focus();
  placeCaretAtEnd(newText);
}

function addShape() {
  const shape = document.createElement('div');
  shape.className = 'mini-card';
  shape.style.width = '220px';
  shape.style.height = '140px';
  shape.style.background = 'linear-gradient(135deg, rgba(109, 94, 252, 0.12), rgba(109, 94, 252, 0.02))';
  shape.style.border = '1px solid rgba(109, 94, 252, 0.12)';
  shape.style.borderRadius = '18px';
  shape.innerHTML = '<h3>Graphic Element</h3><p>Use this block to highlight key points.</p>';
  editorPage.appendChild(shape);
}

function placeCaretAtEnd(element) {
  const range = document.createRange();
  const sel = window.getSelection();
  range.selectNodeContents(element);
  range.collapse(false);
  sel.removeAllRanges();
  sel.addRange(range);
}

function triggerImageUpload() {
  imageUpload.click();
}

imageUpload.addEventListener('change', (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (loadEvent) => {
    const img = document.createElement('img');
    img.src = loadEvent.target.result;
    img.alt = 'Uploaded asset';
    img.style.maxWidth = '300px';
    img.style.borderRadius = '20px';
    img.style.display = 'block';
    img.style.margin = '18px 0';
    img.style.boxShadow = '0 16px 34px rgba(15, 23, 42, 0.1)';
    editorPage.appendChild(img);
    showToast('Image added');
  };
  reader.readAsDataURL(file);
});

document.querySelectorAll('.tool-btn[data-command]').forEach((btn) => {
  btn.addEventListener('click', () => {
    const command = btn.dataset.command;
    executeCommand(command);
    saveState();
  });
});

document.querySelectorAll('.tool-btn[data-align]').forEach((btn) => {
  btn.addEventListener('click', () => {
    const align = btn.dataset.align;
    document.execCommand('justify' + align.charAt(0).toUpperCase() + align.slice(1), false, null);
    saveState();
  });
});

fontSizeRange.addEventListener('input', (event) => {
  executeCommand('fontSize', event.target.value);
  saveState();
});

textColorPicker.addEventListener('input', (event) => {
  executeCommand('foreColor', event.target.value);
  saveState();
});

document.querySelectorAll('.size-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    setPageSize(btn.dataset.size);
    saveState();
  });
});

document.querySelectorAll('.color-swatch').forEach((swatch) => {
  swatch.addEventListener('click', () => {
    const color = swatch.dataset.theme;
    setTheme(color);
    saveState();
    document.querySelectorAll('.color-swatch').forEach((item) => {
      item.classList.toggle('active', item.dataset.theme === color);
    });
  });
});

document.querySelector('[data-add="text"]').addEventListener('click', () => {
  addTextBlock();
  saveState();
});

document.querySelector('[data-add="shape"]').addEventListener('click', () => {
  addShape();
  saveState();
});

document.querySelector('[data-add="image"]').addEventListener('click', () => {
  triggerImageUpload();
});

document.getElementById('newProjectBtn').addEventListener('click', () => {
  localStorage.removeItem(storageKey);
  editorPage.innerHTML = defaultState.content;
  setTheme(defaultState.theme);
  setPageSize(defaultState.size);
  showToast('New project created');
});

document.getElementById('saveProjectBtn').addEventListener('click', saveState);

document.getElementById('downloadBtn').addEventListener('click', () => {
  const blob = new Blob([JSON.stringify({
    theme: document.documentElement.style.getPropertyValue('--primary') || defaultState.theme,
    size: document.querySelector('.size-btn.active')?.dataset.size || defaultState.size,
    content: editorPage.innerHTML
  }, null, 2)], { type: 'application/json' });

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'pixel-documents-studio-project.json';
  anchor.click();
  URL.revokeObjectURL(url);
  showToast('JSON downloaded');
});

document.getElementById('jsonExportBtn').addEventListener('click', () => {
  document.getElementById('downloadBtn').click();
});

document.getElementById('printBtn').addEventListener('click', () => window.print());

document.getElementById('resetBtn').addEventListener('click', () => {
  editorPage.innerHTML = defaultState.content;
  setTheme(defaultState.theme);
  setPageSize(defaultState.size);
  saveState();
  showToast('Layout reset');
});

editorPage.addEventListener('input', () => {
  saveState();
});

applyState();
