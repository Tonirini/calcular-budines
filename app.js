const RECIPES = {
  naranja: {
    name: 'Naranja', emoji: '🍊', mode: '1200', essence: true,
    note: 'El jugo cuenta dentro del líquido total. Completá con agua. No lleva glasé.'
  },
  limon: {
    name: 'Limón con amapola', emoji: '🍋', mode: '1000', essence: true,
    note: '1 limón/kg de premezcla, ½ tapita de Kolaroma/kg y 1 cda de amapola/kg. El glasé se calcula aparte.'
  },
  manzana: {
    name: 'Manzana', emoji: '🍎', mode: '1200', essence: true,
    note: 'La pulpa de manzana va arriba. La cantidad por pieza sigue pendiente.'
  },
  marmolado: {
    name: 'Marmolado', emoji: '🍫', mode: '1000', essence: false, marble: true,
    note: 'Mitad vainilla y mitad chocolate. Nueces: 200 g por kg de premezcla total.'
  },
  vainilla: {
    name: 'Vainilla', emoji: '🧁', mode: '1000', essence: true,
    note: '1 chorro de esencia por kg de premezcla.'
  },
  chocolate: {
    name: 'Chocolate', emoji: '🍫', mode: '1000', essence: false,
    note: 'No lleva esencia.'
  },
  vainilla_chips: {
    name: 'Vainilla y chips', emoji: '🍪', mode: '1000', essence: true,
    note: 'Mini gotas: 200 g por kg de premezcla. Agregar al final.'
  },
  chocolate_blanco: {
    name: 'Chocolate con chips blancos', emoji: '🤍', mode: '1000', essence: false,
    note: 'Bombón blanco: 200 g por kg de premezcla. Agregar al final.'
  },
  cereza_coco: {
    name: 'Cereza y coco', emoji: '🍒', mode: '1200', essence: true,
    note: 'Por budín: 2 cerezas + 50 g coco. La cantidad para matera no está definida.'
  }
};

const BASE = {
  '1200': { premix: 1200, egg: 175, liquid: 425, butter: 200, starch: 3, powder: 3, yield: 1998 },
  '1000': { premix: 1000, egg: 175, liquid: 425, butter: 200, starch: 2, powder: 2, yield: 1785 }
};

const state = [];

const flavorSelect = document.querySelector('#flavor');
const form = document.querySelector('#productionForm');
const validation = document.querySelector('#validation');
const orangeAdjustWrap = document.querySelector('#orangeAdjustWrap');
const orangeAdjust = document.querySelector('#orangeAdjust');
const list = document.querySelector('#productionList');
const meta = document.querySelector('#productionMeta');
const results = document.querySelector('#results');
const clearAll = document.querySelector('#clearAll');

Object.entries(RECIPES).forEach(([key, recipe]) => {
  const option = document.createElement('option');
  option.value = key;
  option.textContent = `${recipe.emoji} ${recipe.name}`;
  flavorSelect.appendChild(option);
});

function num(id) {
  const raw = Number(document.querySelector(`#${id}`).value);
  return Number.isFinite(raw) ? Math.max(0, Math.floor(raw)) : 0;
}

function fmt(value, decimals = 0) {
  return Number(value.toFixed(decimals)).toLocaleString('es-AR');
}

function modeName(mode) {
  return mode === '1200' ? 'Regla 1.200' : 'Premezcla real 1.000';
}

function updateFlavorOptions() {
  orangeAdjustWrap.classList.toggle('hidden', flavorSelect.value !== 'naranja');
}

function addProduction(event) {
  event.preventDefault();
  validation.textContent = '';
  const item = {
    id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
    flavor: flavorSelect.value,
    budines: num('budines'),
    materas: num('materas'),
    planchas: num('planchas'),
    medias: num('medias'),
    orangeAdjust: flavorSelect.value === 'naranja' && orangeAdjust.checked
  };

  if (item.budines + item.materas + item.planchas + item.medias === 0) {
    validation.textContent = 'Cargá al menos una cantidad.';
    return;
  }

  state.push(item);
  ['budines','materas','planchas','medias'].forEach(id => document.querySelector(`#${id}`).value = 0);
  orangeAdjust.checked = false;
  render();
}

function removeItem(id) {
  const index = state.findIndex(x => x.id === id);
  if (index >= 0) state.splice(index, 1);
  render();
}

function itemDescription(item) {
  const parts = [];
  if (item.budines) parts.push(`${item.budines} budín${item.budines === 1 ? '' : 'es'}`);
  if (item.materas) parts.push(`${item.materas} matera${item.materas === 1 ? '' : 's'}`);
  if (item.planchas) parts.push(`${item.planchas} plancha${item.planchas === 1 ? '' : 's'}`);
  if (item.medias) parts.push(`${item.medias} media${item.medias === 1 ? '' : 's'} plancha${item.medias === 1 ? '' : 's'}`);
  if (item.orangeAdjust) parts.push('ajuste naranja');
  return parts.join(' · ');
}

function aggregate() {
  const grouped = {};
  for (const item of state) {
    if (!grouped[item.flavor]) {
      grouped[item.flavor] = { budines:0, materas:0, planchas:0, medias:0, adjustedPiecePremixExtra:0 };
    }
    const g = grouped[item.flavor];
    g.budines += item.budines;
    g.materas += item.materas;
    g.planchas += item.planchas;
    g.medias += item.medias;

    if (item.flavor === 'naranja' && item.orangeAdjust) {
      const base = BASE['1200'];
      const pieceMass = item.budines * 250 + item.materas * 600;
      const factor = pieceMass / base.yield;
      const basePremix = base.premix * factor;
      g.adjustedPiecePremixExtra += basePremix * ((2652 / 2252) - 1);
    }
  }
  return grouped;
}

function calcFlavor(key, quantities) {
  const recipe = RECIPES[key];
  const base = BASE[recipe.mode];
  const pieceMass = quantities.budines * 250 + quantities.materas * 600;
  const pieceFactor = pieceMass / base.yield;
  const planchaFactor = quantities.planchas * 2 + quantities.medias;
  const factor = pieceFactor + planchaFactor;

  const premix = base.premix * factor + (quantities.adjustedPiecePremixExtra || 0);
  const egg = base.egg * factor;
  const liquid = base.liquid * factor;
  const butter = base.butter * factor;
  const starch = base.starch * factor;
  const powder = base.powder * factor;

  return { recipe, base, factor, pieceMass, premix, egg, liquid, butter, starch, powder };
}

function recipeRows(calc, key) {
  const { recipe, premix, egg, liquid, butter, starch, powder } = calc;

  if (recipe.marble) {
    const halfPremix = premix / 2;
    const halfEgg = egg / 2;
    const halfLiquid = liquid / 2;
    const halfButter = butter / 2;
    const halfStarch = starch / 2;
    const halfPowder = powder / 2;
    const nuts = premix * 0.2;
    const vanillaEssence = halfPremix / 1000;

    return `
      <div class="split-grid">
        <div class="split-card">
          <h4>Parte vainilla</h4>
          ${row('Premezcla vainilla', `${fmt(halfPremix)} g`)}
          ${row('Huevo', `${fmt(halfEgg)} g`)}
          ${row('Agua', `${fmt(halfLiquid)} g`)}
          ${row('Manteca', `${fmt(halfButter)} g`)}
          ${row('Maicena', `${fmt(halfStarch,2)} cdas`)}
          ${row('Polvo', `${fmt(halfPowder,2)} cdas`)}
          ${row('Esencia', `${fmt(vanillaEssence,2)} chorros`)}
        </div>
        <div class="split-card">
          <h4>Parte chocolate</h4>
          ${row('Premezcla chocolate', `${fmt(halfPremix)} g`)}
          ${row('Huevo', `${fmt(halfEgg)} g`)}
          ${row('Agua', `${fmt(halfLiquid)} g`)}
          ${row('Manteca', `${fmt(halfButter)} g`)}
          ${row('Maicena', `${fmt(halfStarch,2)} cdas`)}
          ${row('Polvo', `${fmt(halfPowder,2)} cdas`)}
          ${row('Esencia', 'No lleva')}
        </div>
      </div>
      ${row('Nueces', `${fmt(nuts)} g`)}
    `;
  }

  let html = '';
  html += row('Premezcla', `${fmt(premix)} g`);
  html += row('Huevo', `${fmt(egg)} g`);
  html += row(key === 'naranja' || key === 'limon' ? 'Líquido total' : 'Agua', `${fmt(liquid)} g`);
  html += row('Manteca', `${fmt(butter)} g`);
  html += row('Maicena', `${fmt(starch,2)} cdas`);
  html += row('Polvo de hornear', `${fmt(powder,2)} cdas`);

  if (recipe.essence) html += row('Esencia', `${fmt(premix / 1000,2)} chorros`);
  else html += row('Esencia', 'No lleva');

  if (key === 'naranja') {
    html += row('Kolaroma naranja', `${fmt((premix / 1000) * 0.5,2)} tapitas`);
    html += row('Naranjas', `${fmt((premix / 1000) * 2,1)} u aprox.`);
  }
  if (key === 'limon') {
    html += row('Kolaroma limón', `${fmt((premix / 1000) * 0.5,2)} tapitas`);
    html += row('Amapola', `${fmt(premix / 1000,2)} cdas`);
    html += row('Limones para batida', `${fmt(premix / 1000,1)} u aprox.`);
  }
  if (key === 'vainilla_chips') html += row('Mini gotas', `${fmt(premix * 0.2)} g`);
  if (key === 'chocolate_blanco') html += row('Bombón blanco', `${fmt(premix * 0.2)} g`);
  if (key === 'cereza_coco') {
    const q = aggregate()[key];
    html += row('Cerezas para budines', `${q.budines * 2} u`);
    html += row('Coco para budines', `${fmt(q.budines * 50)} g`);
  }
  return html;
}

function row(label, value) {
  return `<div class="recipe-row"><span>${label}</span><strong>${value}</strong></div>`;
}

function renderList() {
  if (!state.length) {
    list.innerHTML = '<div class="empty-state">Agregá un sabor para empezar.</div>';
    meta.textContent = 'Todavía no agregaste productos.';
    return;
  }

  list.innerHTML = state.map(item => {
    const recipe = RECIPES[item.flavor];
    return `<div class="production-item">
      <div>
        <strong>${recipe.emoji} ${recipe.name}</strong>
        <p>${itemDescription(item)}</p>
      </div>
      <button class="remove-btn" type="button" data-remove="${item.id}">Quitar</button>
    </div>`;
  }).join('');

  list.querySelectorAll('[data-remove]').forEach(btn => {
    btn.addEventListener('click', () => removeItem(btn.dataset.remove));
  });

  const totals = state.reduce((acc, x) => {
    acc.budines += x.budines;
    acc.materas += x.materas;
    acc.planchas += x.planchas;
    acc.medias += x.medias;
    return acc;
  }, {budines:0,materas:0,planchas:0,medias:0});

  meta.textContent = `${totals.budines} budines · ${totals.materas} materas · ${totals.planchas} planchas · ${totals.medias} medias planchas`;
}

function renderResults() {
  const grouped = aggregate();
  const keys = Object.keys(grouped);
  if (!keys.length) {
    results.innerHTML = '<div class="empty-state">Las batidas aparecerán acá.</div>';
    return;
  }

  results.innerHTML = keys.map(key => {
    const q = grouped[key];
    const calc = calcFlavor(key, q);
    const recipe = calc.recipe;
    const planchaText = q.planchas || q.medias ? ` · ${q.planchas} plancha(s) · ${q.medias} media(s)` : '';
    const adjustmentNote = key === 'naranja' && q.adjustedPiecePremixExtra > 0
      ? ` Se sumaron ${fmt(q.adjustedPiecePremixExtra)} g de premezcla por el ajuste práctico aplicado a budines/materas.`
      : '';

    return `<article class="recipe-card">
      <span class="tag">${modeName(recipe.mode)}</span>
      <h3>${recipe.emoji} ${recipe.name}</h3>
      <p class="recipe-subtitle">${q.budines} budines · ${q.materas} materas${planchaText}</p>
      ${recipeRows(calc, key)}
      <p class="recipe-note">${recipe.note}${adjustmentNote}</p>
    </article>`;
  }).join('');
}

function render() {
  renderList();
  renderResults();
}

flavorSelect.addEventListener('change', updateFlavorOptions);
form.addEventListener('submit', addProduction);
clearAll.addEventListener('click', () => {
  state.splice(0, state.length);
  validation.textContent = '';
  render();
});

updateFlavorOptions();
render();
