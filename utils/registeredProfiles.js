const fs = require('fs');
const path = require('path');

const profilesPath = path.join(__dirname, '../sessions/registeredProfiles.json');

function loadProfiles() {
  try {
    if (!fs.existsSync(profilesPath)) return [];

    const raw = fs.readFileSync(profilesPath, 'utf-8').trim();

    if (!raw) return [];

    const data = JSON.parse(raw);

    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.warn('[WARN] Не удалось загрузить registeredProfiles.json:', err.message);
    return [];
  }
}

function saveProfile(profile) {
    const profiles = loadProfiles();
    const index = profiles.findIndex(p => p.phoneNumber === profile.phoneNumber);
  
    if (index !== -1) {
      profiles[index] = { ...profiles[index], ...profile };
    } else {
      profiles.push(profile);
    }
  
    fs.writeFileSync(profilesPath, JSON.stringify(profiles, null, 2));
  }
  

function getProfiles() {
  return loadProfiles();
}

function findByEmail(email) {
  return loadProfiles().find(p => p.email === email);
}

function findByPhone(phoneNumber) {
  return loadProfiles().find(p => p.phoneNumber === phoneNumber);
}

function updateProfile(phoneNumber, newData) {
  const profiles = loadProfiles();
  const index = profiles.findIndex(p => p.phoneNumber === phoneNumber);
  if (index !== -1) {
    profiles[index] = { ...profiles[index], ...newData };
    fs.writeFileSync(profilesPath, JSON.stringify(profiles, null, 2));
  }
}

module.exports = {
  saveProfile,
  getProfiles,
  findByEmail,
  findByPhone,
  updateProfile,
};
