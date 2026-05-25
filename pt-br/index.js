import { COUNTRIES } from '../countries.js';

const COUNTRIES_PT_BR = {
  Argentina: 'Argentina',
  Belgium: 'Bélgica',
  Brazil: 'Brasil',
  Canada: 'Canadá',
  England: 'Inglaterra',
  France: 'França',
  Germany: 'Alemanha',
  Italy: 'Itália',
  Japan: 'Japão',
  Mexico: 'México',
  Netherlands: 'Países Baixos',
  Portugal: 'Portugal',
  'South Korea': 'Coreia do Sul',
  Spain: 'Espanha',
  'United States': 'Estados Unidos',
};

const countries = COUNTRIES.slice().sort((a, b) =>
  a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }),
);

const form = document.getElementById('stickerForm');
const downloadBtn = document.getElementById('download-btn');
const uploadBox = document.getElementById('uploadBox');
const playerPhotoInput = document.getElementById('playerPhoto');
const uploadPreview = document.getElementById('uploadPreview');
const uploadHint = uploadBox ? uploadBox.querySelector('.hint') : null;
const countrySelect = document.getElementById('country');

const stickerPlayerImage = document.getElementById('sticker-player-image');
const stickerPlayerName = document.getElementById('sticker-player-name');
const stickerPlayerMeta = document.getElementById('sticker-player-meta');
const stickerCountryFrame = document.getElementById(
  'sticker-country-image-frame',
);
const stickerCountryName = document.getElementById('sticker-country-name');
const stickerClub = document.getElementById('sticker-club');
const stickerOverlay = document.getElementById('sticker-overlay');
const stickerCountryShell = document.getElementById(
  'sticker-country-image-shell',
);
const stickerCard = document.getElementById('sticker-card');

const formData = {
  name: '',
  birthDate: '',
  height: '',
  weight: '',
  country: '',
  imagePreview: '../assets/images/person-silhouette.png',
  imageUploaded: false,
  golden: false,
  club: '',
};

function initCountryOptions() {
  countries.forEach((country) => {
    const option = document.createElement('option');
    option.value = country.name;
    option.textContent = `${country.flag} ${getCountryLabel(country.name)}`;
    countrySelect.appendChild(option);
  });
}

function getCountryLabel(name) {
  return COUNTRIES_PT_BR[name] || name;
}

function formatHeight(cm) {
  const meters = Number.parseInt(cm, 10) / 100;
  return `${meters.toFixed(2).replace('.', ',')}m`;
}

function clampNumericInput(value, min, max) {
  if (value === '') return '';

  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) return '';

  return String(Math.min(max, Math.max(min, parsed)));
}

function getSelectedCountry() {
  return countries.find((country) => country.name === formData.country);
}

function handlePhotoUpload(event) {
  const file = event.target.files && event.target.files[0];

  if (!file) {
    formData.imageUploaded = false;
    if (uploadHint) uploadHint.textContent = 'Imagem padrão: player_photo.png';
    renderSticker();
    return;
  }

  const reader = new FileReader();
  reader.onloadend = () => {
    formData.imagePreview = String(reader.result);
    formData.imageUploaded = true;
    uploadPreview.src = String(reader.result);

    if (uploadHint) {
      const sizeKB = (file.size / 1024).toFixed(0);
      uploadHint.textContent = `${file.name} — ${sizeKB} KB`;
      uploadHint.title = file.type || '';
    }

    renderSticker();
  };
  reader.readAsDataURL(file);
}

function updateFormData(event) {
  const { name, type, value, checked } = event.target;
  if (name === 'height') {
    event.target.value = clampNumericInput(value, 0, 300);
    formData[name] = event.target.value;
    renderSticker();
    return;
  }

  if (name === 'weight') {
    event.target.value = clampNumericInput(value, 0, 300);
    formData[name] = event.target.value;
    renderSticker();
    return;
  }

  formData[name] = type === 'checkbox' ? checked : value;
  renderSticker();
}

async function downloadSticker() {
  if (!window.html2canvas) {
    alert(
      'O html2canvas não carregou. Verifique sua conexão com a internet e recarregue a página.',
    );
    return;
  }

  if (!stickerCard) {
    alert('A pré-visualização da figurinha ainda não está disponível.');
    return;
  }

  downloadBtn.disabled = true;
  downloadBtn.textContent = 'Baixando...';

  try {
    const canvas = await window.html2canvas(stickerCard, {
      backgroundColor: null,
      scale: 2,
      useCORS: true,
    });

    const link = document.createElement('a');
    link.download = `${formData.name.trim().replace(/\s+/g, '_')}_worldcup2026_sticker.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  } catch (error) {
    console.error('Erro ao baixar a figurinha:', error);
    alert('Não foi possível baixar a figurinha. Tente novamente.');
  } finally {
    downloadBtn.disabled = false;
    downloadBtn.textContent = 'Baixar Figurinha';
  }
}

uploadBox.addEventListener('click', () => playerPhotoInput.click());
playerPhotoInput.addEventListener('change', handlePhotoUpload);

form.addEventListener('input', updateFormData);

if (countrySelect) {
  countrySelect.addEventListener('change', (e) => {
    formData.country = e.target.value;
    renderSticker();
  });
}

downloadBtn.addEventListener('click', downloadSticker);

initCountryOptions();
renderSticker();

function renderSticker() {
  const selectedCountry = getSelectedCountry();
  const shouldShowShadow = !selectedCountry && !formData.imageUploaded;

  if (stickerPlayerImage) {
    stickerPlayerImage.src = formData.imageUploaded
      ? formData.imagePreview
      : '../assets/images/person-silhouette.png';
    stickerPlayerImage.classList.toggle(
      'sticker-player-image--shadow-pulse',
      shouldShowShadow,
    );
    stickerPlayerImage.style.setProperty(
      '--sticker-shadow-color',
      formData.golden ? '202, 124, 1' : '0, 128, 128',
    );
    if (shouldShowShadow) {
      stickerPlayerImage.style.removeProperty('filter');
    } else {
      stickerPlayerImage.style.filter = 'none';
    }
  }

  if (stickerPlayerName) {
    const name = (formData.name || '').trim();
    stickerPlayerName.textContent = name || '???';
  }

  if (stickerPlayerMeta) {
    const birth = formData.birthDate
      ? formatDateShort(formData.birthDate)
      : '???';
    const height = formData.height ? formatHeight(formData.height) : '???';
    const weight = formData.weight ? `${formData.weight} kg` : '???';
    stickerPlayerMeta.textContent = `${birth} | ${height} | ${weight}`;
  }

  const selected = selectedCountry;

  if (stickerCountryFrame) {
    const imgName = selected
      ? selected.flagImage ||
        `${selected.name.toLowerCase().replace(/\s+/g, '-')}.png`
      : '';
    stickerCountryFrame.style.backgroundImage = selected
      ? `url('../assets/images/flags/${imgName}')`
      : 'none';
  }

  if (stickerOverlay) {
    const overlayName = selected
      ? selected.flagImage ||
        `${selected.name.toLowerCase().replace(/\s+/g, '-')}.png`
      : 'silhouette-overlay.png';
    stickerOverlay.src = selected
      ? `../assets/images/overlays/${overlayName}`
      : '../assets/images/overlays/silhouette-overlay.png';
    stickerOverlay.alt = selected
      ? `Overlay de ${getCountryLabel(selected.name)}`
      : 'Forma do overlay da figurinha';
  }

  if (stickerCountryName) {
    stickerCountryName.textContent = selected
      ? selected.code || selected.name
      : '?';
  }

  if (stickerClub) {
    const club = (formData.club || '').trim();
    stickerClub.textContent = club || '???';
  }

  if (stickerCountryShell) {
    stickerCountryShell.style.display = selected ? '' : 'none';
    stickerCountryShell.style.backgroundColor = formData.golden
      ? '#F5A201'
      : '#01c1cc';
  }

  if (stickerCard) {
    if (formData.golden) {
      stickerCard.style.backgroundImage =
        "url('../assets/images/sticker-backgrounds/golden-bg.png')";
      stickerCard.style.backgroundColor = '';
      stickerCard.style.backgroundSize = 'cover';
      stickerCard.style.backgroundPosition = 'center';
    } else {
      stickerCard.style.backgroundImage = 'none';
      stickerCard.style.backgroundColor = '#01c1cc';
    }
  }
}

function formatDateShort(iso) {
  if (!iso) return '???';

  const ymd = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  let d;
  if (ymd) {
    d = new Date(Number(ymd[1]), Number(ymd[2]) - 1, Number(ymd[3]));
  } else {
    d = new Date(iso);
  }
  if (Number.isNaN(d.getTime())) return '???';
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
}
