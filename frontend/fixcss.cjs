const fs = require('fs');
let css = fs.readFileSync('src/index.css', 'utf16le');
if (css.includes('. e d i t a b l e')) {
    css = css.split('. e d i t a b l e')[0];
    css += `
.editable-input:focus {
  border-color: var(--primary) !important;
  background: #fff !important;
  box-shadow: 0 0 0 2px rgba(91,141,239,0.3);
}

.editable-image-wrapper:hover::after {
  content: "";
  position: absolute;
  inset: 0;
  border: 2px dashed var(--primary);
  pointer-events: none;
  border-radius: inherit;
}
`;
    fs.writeFileSync('src/index.css', css, 'utf8');
} else {
    let raw = fs.readFileSync('src/index.css', 'utf8');
    raw = raw.replace(/\.\s*e\s*d\s*i\s*t\s*a\s*b\s*l\s*e.*/s, '');
    if (!raw.includes('.editable-input:focus')) {
        raw += `
.editable-input:focus {
  border-color: var(--primary) !important;
  background: #fff !important;
  box-shadow: 0 0 0 2px rgba(91,141,239,0.3);
}

.editable-image-wrapper:hover::after {
  content: "";
  position: absolute;
  inset: 0;
  border: 2px dashed var(--primary);
  pointer-events: none;
  border-radius: inherit;
}
`;
        fs.writeFileSync('src/index.css', raw, 'utf8');
    }
}
