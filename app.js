// Calculadora de Dieta BARF para Perros y Gatos
// Proporciones nutricionales basadas en el modelo biológico natural (Dr. Ian Billinghurst / Prey Model)

const PROFILES = {
  dog: [
    { id: 'sedentary', name: 'Adulto sedentario / Senior / Con sobrepeso (2.0%)', pct: 2.0 },
    { id: 'normal', name: 'Adulto actividad normal / paseo diario (2.5%)', pct: 2.5 },
    { id: 'active', name: 'Adulto muy activo / deportista (3.0%)', pct: 3.0 },
    { id: 'working', name: 'Perro de trabajo / agility / bajo peso (4.0%)', pct: 4.0 },
    { id: 'puppy_young', name: 'Cachorro 2 a 4 meses (9.0%)', pct: 9.0 },
    { id: 'puppy_mid', name: 'Cachorro 4 a 6 meses (7.0%)', pct: 7.0 },
    { id: 'puppy_older', name: 'Cachorro 6 a 10 meses (5.0%)', pct: 5.0 },
    { id: 'puppy_junior', name: 'Cachorro 10 a 12 meses (3.5%)', pct: 3.5 }
  ],
  cat: [
    { id: 'normal', name: 'Gato adulto peso normal / esterilizado (3.0%)', pct: 3.0 },
    { id: 'active', name: 'Gato adulto activo / con acceso a exterior (3.5%)', pct: 3.5 },
    { id: 'kitten', name: 'Gatito en crecimiento menor a 1 año (7.0%)', pct: 7.0 }
  ]
};

const COMPOSITIONS = {
  dog: {
    bones: { pct: 50, title: 'Huesos Carnosos (50%)', desc: 'Alitas, cuellos de pollo, carcasas, puntas de pecho o codorniz. SIEMPRE CRUDOS.' },
    meat: { pct: 30, title: 'Carne Muscular (30%)', desc: 'Pechuga de pollo, ternera magra, cerdo, pescado blanco, corazón vacuno.' },
    organs: { pct: 10, title: 'Vísceras y Órganos (10%)', desc: '5% hígado obligatorio (vitamina A) + 5% otras vísceras (riñón, sesos, bazo).' },
    veg: { pct: 10, title: 'Vegetales y Frutas (10%)', desc: '7% calabaza/espinaca/zanahoria triturada + 3% manzana o arándanos.' }
  },
  cat: {
    bones: { pct: 40, title: 'Huesos Carnosos Felinos (40%)', desc: 'Huesos pequeños y blandos: cuellos de pollo, alitas tiernas o costillitas de conejo.' },
    meat: { pct: 50, title: 'Carne Muscular y Corazón (50%)', desc: 'Pollo, pavo, ternera y corazón (fuente vital de taurina para felinos).' },
    organs: { pct: 10, title: 'Vísceras (10%)', desc: '5% hígado + 5% riñón/bazo. Carnívoros estrictos sin necesidad de vegetales.' },
    veg: { pct: 0, title: 'Vegetales / Fibra (0%)', desc: 'Los felinos son carnívoros estrictos. No requieren vegetales (opcional 2% fibra calabaza).' }
  }
};

const PRESETS = {
  dog_labrador: { species: 'dog', weight: 30, profile: 'active', meals: 2 },
  dog_frenchie: { species: 'dog', weight: 12, profile: 'normal', meals: 2 },
  dog_caniche: { species: 'dog', weight: 4.5, profile: 'normal', meals: 2 },
  dog_puppy: { species: 'dog', weight: 8, profile: 'puppy_mid', meals: 3 },
  cat_adult: { species: 'cat', weight: 4.5, profile: 'normal', meals: 2 }
};

let state = {
  species: 'dog',
  weight: 20,
  profile: 'normal',
  meals: 2,
  batchDays: 7
};

function calculateBarf() {
  const speciesProfiles = PROFILES[state.species];
  const currentProfile = speciesProfiles.find(p => p.id === state.profile) || speciesProfiles[0];
  const pct = currentProfile.pct;

  const weightKg = parseFloat(state.weight) || 1;
  const dailyTotalGrams = weightKg * 1000 * (pct / 100);
  const mealsCount = parseInt(state.meals, 10) || 1;
  const perMealGrams = dailyTotalGrams / mealsCount;

  const comp = COMPOSITIONS[state.species];
  const bonesGrams = dailyTotalGrams * (comp.bones.pct / 100);
  const meatGrams = dailyTotalGrams * (comp.meat.pct / 100);
  const organsGrams = dailyTotalGrams * (comp.organs.pct / 100);
  const vegGrams = dailyTotalGrams * (comp.veg.pct / 100);

  // Batch calculations (7 or 30 days)
  const batchDays = state.batchDays || 7;
  const batchTotalGrams = dailyTotalGrams * batchDays;
  const batchBonesGrams = bonesGrams * batchDays;
  const batchMeatGrams = meatGrams * batchDays;
  const batchOrgansGrams = organsGrams * batchDays;
  const batchVegGrams = vegGrams * batchDays;

  return {
    pct,
    profileName: currentProfile.name,
    dailyTotalGrams,
    perMealGrams,
    mealsCount,
    bonesGrams,
    meatGrams,
    organsGrams,
    liverGrams: organsGrams * 0.5,
    otherOrgansGrams: organsGrams * 0.5,
    vegGrams,
    batchDays,
    batchTotalGrams,
    batchBonesGrams,
    batchMeatGrams,
    batchOrgansGrams,
    batchVegGrams
  };
}

function updateUI() {
  const res = calculateBarf();
  const comp = COMPOSITIONS[state.species];

  // Hero metrics
  const heroDailyEl = document.getElementById('hero-daily-grams');
  const heroMealEl = document.getElementById('hero-meal-grams');
  if (heroDailyEl) heroDailyEl.textContent = Math.round(res.dailyTotalGrams) + ' g';
  if (heroMealEl) heroMealEl.textContent = Math.round(res.perMealGrams) + ' g';

  // Breakdown cards
  const bonesEl = document.getElementById('val-bones');
  const meatEl = document.getElementById('val-meat');
  const organsEl = document.getElementById('val-organs');
  const vegEl = document.getElementById('val-veg');
  const vegCard = document.getElementById('card-veg');

  if (bonesEl) bonesEl.textContent = Math.round(res.bonesGrams) + ' g/día';
  if (meatEl) meatEl.textContent = Math.round(res.meatGrams) + ' g/día';
  if (organsEl) organsEl.textContent = `${Math.round(res.organsGrams)} g/día (${Math.round(res.liverGrams)}g hígado + ${Math.round(res.otherOrgansGrams)}g otros)`;
  
  if (vegEl) {
    if (res.vegGrams > 0) {
      vegEl.textContent = Math.round(res.vegGrams) + ' g/día';
      if (vegCard) vegCard.style.display = 'block';
    } else {
      vegEl.textContent = '0 g (no requiere)';
      if (vegCard) vegCard.style.display = 'none';
    }
  }

  // Titles & Descs dynamic update for species
  const bonesTitle = document.getElementById('title-bones');
  const bonesDesc = document.getElementById('desc-bones');
  const meatTitle = document.getElementById('title-meat');
  const meatDesc = document.getElementById('desc-meat');
  const organsTitle = document.getElementById('title-organs');
  const organsDesc = document.getElementById('desc-organs');

  if (bonesTitle) bonesTitle.textContent = comp.bones.title;
  if (bonesDesc) bonesDesc.textContent = comp.bones.desc;
  if (meatTitle) meatTitle.textContent = comp.meat.title;
  if (meatDesc) meatDesc.textContent = comp.meat.desc;
  if (organsTitle) organsTitle.textContent = comp.organs.title;
  if (organsDesc) organsDesc.textContent = comp.organs.desc;

  // Batch Shopping Planner Table
  const batchDaysLabel = document.getElementById('batch-days-label');
  if (batchDaysLabel) batchDaysLabel.textContent = res.batchDays + ' días';

  const batchTotalEl = document.getElementById('batch-total');
  const batchBonesEl = document.getElementById('batch-bones');
  const batchMeatEl = document.getElementById('batch-meat');
  const batchOrgansEl = document.getElementById('batch-organs');
  const batchVegEl = document.getElementById('batch-veg');

  const toKgOrG = (g) => g >= 1000 ? (g / 1000).toFixed(2) + ' kg' : Math.round(g) + ' g';

  if (batchTotalEl) batchTotalEl.textContent = toKgOrG(res.batchTotalGrams);
  if (batchBonesEl) batchBonesEl.textContent = toKgOrG(res.batchBonesGrams);
  if (batchMeatEl) batchMeatEl.textContent = toKgOrG(res.batchMeatGrams);
  if (batchOrgansEl) batchOrgansEl.textContent = toKgOrG(res.batchOrgansGrams) + ` (${toKgOrG(res.batchOrgansGrams * 0.5)} hígado)`;
  if (batchVegEl) batchVegEl.textContent = res.batchVegGrams > 0 ? toKgOrG(res.batchVegGrams) : '0 g';

  // Sticky Mobile Bar
  const stickyDaily = document.getElementById('sticky-daily');
  const stickyMeal = document.getElementById('sticky-meal');
  if (stickyDaily) stickyDaily.textContent = Math.round(res.dailyTotalGrams) + ' g/día';
  if (stickyMeal) stickyMeal.textContent = Math.round(res.perMealGrams) + ` g × ${res.mealsCount}`;

  saveState();
}

function renderProfiles() {
  const select = document.getElementById('profile-select');
  if (!select) return;

  const list = PROFILES[state.species];
  select.innerHTML = list.map(p => `
    <option value="${p.id}" ${state.profile === p.id ? 'selected' : ''}>${p.name}</option>
  `).join('');

  // If previous profile doesn't exist in new species, pick default
  if (!list.some(p => p.id === state.profile)) {
    state.profile = list[0].id;
    select.value = state.profile;
  }
}

function setSpecies(species) {
  state.species = species;
  document.querySelectorAll('.species-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-species') === species);
  });
  renderProfiles();
  updateUI();
}

function applyPreset(presetKey) {
  const p = PRESETS[presetKey];
  if (!p) return;

  state.species = p.species;
  state.weight = p.weight;
  state.profile = p.profile;
  state.meals = p.meals;

  document.querySelectorAll('.species-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-species') === p.species);
  });

  const weightInput = document.getElementById('weight-input');
  if (weightInput) weightInput.value = p.weight;

  renderProfiles();

  const profileSelect = document.getElementById('profile-select');
  if (profileSelect) profileSelect.value = p.profile;

  document.querySelectorAll('.meal-btn').forEach(btn => {
    btn.classList.toggle('active', parseInt(btn.getAttribute('data-meals'), 10) === p.meals);
  });

  updateUI();
}

function shareBatch() {
  const res = calculateBarf();
  const animalName = state.species === 'dog' ? '🐶 Perro' : '🐱 Gato';
  const toKgOrG = (g) => g >= 1000 ? (g / 1000).toFixed(2) + ' kg' : Math.round(g) + ' g';

  let text = `🥩 Menú Dieta BARF (${animalName} de ${state.weight} kg)\n`;
  text += `---------------------------------\n`;
  text += `🍽️ Porción Diaria: ${Math.round(res.dailyTotalGrams)} g/día (${res.pct}% peso)\n`;
  text += `🥣 En ${res.mealsCount} tomas: ${Math.round(res.perMealGrams)} g por comida\n\n`;
  text += `📋 Desglose Diario:\n`;
  text += `• Huesos carnosos crudos: ${Math.round(res.bonesGrams)} g\n`;
  text += `• Carne muscular magra: ${Math.round(res.meatGrams)} g\n`;
  text += `• Vísceras (hígado + riñón): ${Math.round(res.organsGrams)} g\n`;
  if (res.vegGrams > 0) {
    text += `• Verduras y frutas trituradas: ${Math.round(res.vegGrams)} g\n`;
  }
  text += `---------------------------------\n`;
  text += `🛒 Lista de Compra para ${res.batchDays} Días:\n`;
  text += `• Total a preparar: ${toKgOrG(res.batchTotalGrams)}\n`;
  text += `• Huesos carnosos: ${toKgOrG(res.batchBonesGrams)}\n`;
  text += `• Carne: ${toKgOrG(res.batchMeatGrams)}\n`;
  text += `• Vísceras: ${toKgOrG(res.batchOrgansGrams)}\n`;
  if (res.batchVegGrams > 0) {
    text += `• Vegetales: ${toKgOrG(res.batchVegGrams)}\n`;
  }
  text += `\n⚠️ Recuerda congelar mínimo 3 días a -18°C antes de servir.\n`;
  text += `Calculado en: https://sebiglesias.com.ar/dieta-barf/`;

  if (navigator.share) {
    navigator.share({
      title: 'Menú Dieta BARF Mascota',
      text: text,
      url: 'https://sebiglesias.com.ar/dieta-barf/'
    }).catch(() => {});
  } else {
    navigator.clipboard.writeText(text).then(() => {
      const shareBtn = document.getElementById('btn-share');
      if (shareBtn) {
        const orig = shareBtn.innerHTML;
        shareBtn.innerHTML = '✓ ¡Copiado al portapapeles!';
        setTimeout(() => shareBtn.innerHTML = orig, 2500);
      }
    });
  }
}

function saveState() {
  try {
    localStorage.setItem('barf_calc_state', JSON.stringify(state));
  } catch (e) {}
}

function loadState() {
  try {
    const saved = localStorage.getItem('barf_calc_state');
    if (saved) {
      const parsed = JSON.parse(saved);
      state = Object.assign(state, parsed);
    }
  } catch (e) {}
}

document.addEventListener('DOMContentLoaded', () => {
  loadState();

  // Species buttons
  document.querySelectorAll('.species-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      setSpecies(btn.getAttribute('data-species'));
    });
  });

  // Weight input
  const weightInput = document.getElementById('weight-input');
  if (weightInput) {
    weightInput.value = state.weight;
    weightInput.addEventListener('input', (e) => {
      state.weight = parseFloat(e.target.value) || 0;
      updateUI();
    });
  }

  // Profile select
  renderProfiles();
  const profileSelect = document.getElementById('profile-select');
  if (profileSelect) {
    profileSelect.value = state.profile;
    profileSelect.addEventListener('change', (e) => {
      state.profile = e.target.value;
      updateUI();
    });
  }

  // Meal count buttons
  document.querySelectorAll('.meal-btn').forEach(btn => {
    if (parseInt(btn.getAttribute('data-meals'), 10) === state.meals) {
      btn.classList.add('active');
    }
    btn.addEventListener('click', () => {
      document.querySelectorAll('.meal-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.meals = parseInt(btn.getAttribute('data-meals'), 10) || 2;
      updateUI();
    });
  });

  // Batch tabs (7 vs 30 days)
  document.querySelectorAll('.batch-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.batch-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      state.batchDays = parseInt(tab.getAttribute('data-days'), 10) || 7;
      updateUI();
    });
  });

  // Presets
  document.querySelectorAll('.preset-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      applyPreset(chip.getAttribute('data-preset'));
    });
  });

  // Action buttons
  const shareBtn = document.getElementById('btn-share');
  if (shareBtn) shareBtn.addEventListener('click', shareBatch);

  const printBtn = document.getElementById('btn-print');
  if (printBtn) printBtn.addEventListener('click', () => window.print());

  const stickyBtn = document.getElementById('sticky-share-btn');
  if (stickyBtn) stickyBtn.addEventListener('click', shareBatch);

  // Theme toggle
  const themeBtn = document.getElementById('theme-toggle');
  if (themeBtn) {
    const currentTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', currentTheme);
    themeBtn.textContent = currentTheme === 'light' ? '🌙' : '☀️';

    themeBtn.addEventListener('click', () => {
      const now = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', now);
      localStorage.setItem('theme', now);
      themeBtn.textContent = now === 'light' ? '🌙' : '☀️';
    });
  }

  updateUI();

  // Register SW
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }
});
