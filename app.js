/* Shared with the catalog check; only configuration data is encoded. */
function presetCode(preset) {
  if (preset.type !== 'CardPriority' || !Array.isArray(preset.data) ||
      !preset.data.length || preset.data.length > 100 ||
      preset.data.some(card => typeof card !== 'string' || !card.trim() || card.length > 100) ||
      new Set(preset.data).size !== preset.data.length)
    throw new Error('Invalid card priority preset.');
  const bytes = new TextEncoder().encode(JSON.stringify({type: preset.type, version: 1, data: preset.data}));
  return 'RR-' + btoa(Array.from(bytes, byte => String.fromCharCode(byte)).join(''));
}
if (typeof module !== 'undefined') module.exports = {presetCode};
if (typeof document !== 'undefined') {
  const catalog = window.RR_PRESETS;
  const list = document.querySelector('#presets');
  const search = document.querySelector('#search');
  const mode = document.querySelector('#mode');
  const status = document.querySelector('#status');
  const node = (tag, text, className) => {
    const element = document.createElement(tag);
    element.textContent = text;
    if (className) element.className = className;
    return element;
  };
  function render() {
    list.replaceChildren();
    const query = search.value.trim().toLowerCase();
    const matches = catalog.filter(p => (!mode.value || p.mode === mode.value) &&
      [p.name, p.author, p.description, ...p.data].join(' ').toLowerCase().includes(query));
    document.querySelector('#count').textContent = `${matches.length} presets`;
    for (const preset of matches) {
      const card = node('article', '', 'preset');
      const code = presetCode(preset);
      card.append(node('span', `CARD PRIORITY / ${preset.mode}`, 'tag'), node('h3', preset.name),
        node('p', preset.description), node('p', `By ${preset.author}`));
      const order = node('ol', '');
      preset.data.forEach(name => order.append(node('li', name)));
      const details = node('details', '');
      details.append(node('summary', 'View full priority order'), order);
      card.append(details);
      const actions = node('div', '', 'actions');
      const copy = node('button', 'Copy import code');
      copy.onclick = async () => {
        try {
          await navigator.clipboard.writeText(code);
          status.textContent = `Copied ${preset.name}. Open ${preset.mode} Card Priority → Import in the macro.`;
        } catch {
          let fallback = card.querySelector('textarea');
          if (!fallback) {
            fallback = node('textarea', '');
            fallback.readOnly = true;
            fallback.setAttribute('aria-label', 'Import code — select and copy');
            card.append(fallback);
          }
          fallback.value = code;
          fallback.focus(); fallback.select();
          status.textContent = 'Clipboard unavailable. Copy the selected code manually.';
        }
      };
      const download = node('button', 'Download', 'secondary');
      download.onclick = () => {
        const url = URL.createObjectURL(new Blob([code + '\n'], {type: 'text/plain;charset=utf-8'}));
        const link = node('a', '');
        link.href = url; link.download = preset.id + '.txt';
        document.body.append(link); link.click(); link.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        status.textContent = 'Open the downloaded text file and paste its code into Card Priority → Import.';
      };
      actions.append(copy, download); card.append(actions); list.append(card);
    }
    if (!matches.length) list.append(node('p', 'No presets match. Try another search or mode.'));
  }
  try {
    catalog.forEach(presetCode);
    [...new Set(catalog.map(p => p.mode))].sort().forEach(name => {
      const option = node('option', name); option.value = name; mode.append(option);
    });
    const requestedMode = new URLSearchParams(location.search).get('mode');
    if ([...mode.options].some(option => option.value === requestedMode)) mode.value = requestedMode;
    search.addEventListener('input', render); mode.addEventListener('change', render); render();
  } catch {
    status.textContent = 'The preset catalog could not load. Please report this on GitHub.';
  }
}
