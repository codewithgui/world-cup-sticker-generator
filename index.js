import { COUNTRIES } from './countries.js';

const countries = COUNTRIES.slice().sort((a, b) =>
  a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }),
);

const form = document.getElementById('stickerForm');
const downloadBtn = document.getElementById('download-btn');
const resultSection = document.getElementById('result-section');
const uploadBox = document.getElementById('uploadBox');
const playerPhotoInput = document.getElementById('playerPhoto');
const uploadPreview = document.getElementById('uploadPreview');
const uploadHint = uploadBox ? uploadBox.querySelector('.hint') : null;
const countrySelect = document.getElementById('country');

const stickerPlayerImage = document.getElementById('sticker-player-image');
const stickerPlayerName = document.getElementById('sticker-player-name');
const stickerPlayerMeta = document.getElementById('sticker-player-meta');
const stickerCountryImage = document.getElementById('sticker-country-image');
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
  imagePreview: 'assets/images/person-silhouette.png',
  imageUploaded: false,
  golden: false,
  club: '',
};

function initCountryOptions() {
  countries.forEach((country) => {
    const option = document.createElement('option');
    option.value = country.name;
    option.textContent = `${country.flag} ${country.name}`;
    countrySelect.appendChild(option);
  });
}

function calculateAge(birthDate) {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age -= 1;
  }

  return age;
}

function formatHeight(cm) {
  const meters = Number.parseInt(cm, 10) / 100;
  return `${meters.toFixed(2).replace('.', ',')}m`;
}

function isFormValid() {
  return (
    formData.name &&
    formData.country &&
    formData.imageUploaded &&
    formData.height &&
    formData.weight &&
    formData.birthDate
  );
}

function updateGenerateButtonState() {}

function getSelectedCountry() {
  return countries.find((country) => country.name === formData.country);
}

function handlePhotoUpload(event) {
  const file = event.target.files && event.target.files[0];

  if (!file) {
    formData.imageUploaded = false;
    if (uploadHint)
      uploadHint.textContent = 'Placeholder image: player_photo.png';
    updateGenerateButtonState();
    return;
  }

  const reader = new FileReader();
  reader.onloadend = () => {
    formData.imagePreview = reader.result;
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
  formData[name] = type === 'checkbox' ? checked : value;
  renderSticker();
}

async function downloadSticker() {
  if (!window.html2canvas) {
    alert(
      'html2canvas failed to load. Check your internet connection and reload the page.',
    );
    return;
  }

  if (!stickerCard) {
    alert('Sticker preview is not available yet.');
    return;
  }

  downloadBtn.disabled = true;
  downloadBtn.textContent = 'Downloading...';

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
    console.error('Error downloading sticker:', error);
    alert('Could not download sticker. Please try again.');
  } finally {
    downloadBtn.disabled = false;
    downloadBtn.textContent = 'Download Sticker';
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
      : 'assets/images/person-silhouette.png';
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
  if (selected && stickerCountryImage) {
    const imgName =
      selected.flagImage ||
      `${selected.name.toLowerCase().replace(/\s+/g, '-')}.png`;
    stickerCountryImage.src = `assets/images/flags/${imgName}`;
    stickerCountryImage.alt = `${selected.name} flag`;
  }

  if (stickerOverlay) {
    const overlayName = selected
      ? selected.flagImage ||
        `${selected.name.toLowerCase().replace(/\s+/g, '-')}.png`
      : 'silhouette-overlay.png';
    stickerOverlay.src = selected
      ? `assets/images/overlays/${overlayName}`
      : 'assets/images/overlays/silhouette-overlay.png';
    stickerOverlay.alt = selected
      ? `${selected.name} overlay`
      : 'Sticker overlay shape';
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
        "url('assets/images/sticker-backgrounds/golden-bg.png')";
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
