// Relative path so it runs seamlessly on Vercel and local environments
const API_BASE = "/api";

document.addEventListener('DOMContentLoaded', () => {
  initSpotlight();
  initTypewriter();
  initJointParallax();
  loadAllContent();
});

// 1. Mouse Spotlight Tracker
function initSpotlight() {
  const spotlight = document.createElement('div');
  spotlight.className = 'mouse-spotlight';
  document.body.prepend(spotlight);

  window.addEventListener('pointermove', (e) => {
    document.documentElement.style.setProperty('--cursor-x', `${e.clientX}px`);
    document.documentElement.style.setProperty('--cursor-y', `${e.clientY}px`);
  });
}

// 2. Centered Background Joint Image Parallax
function initJointParallax() {
  const jointBg = document.querySelector('.hero-joint-bg');
  const heroSection = document.querySelector('.hero');
  if (!jointBg || !heroSection) return;

  heroSection.addEventListener('mousemove', (e) => {
    const rect = heroSection.getBoundingClientRect();
    const x = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
    const y = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);

    const moveX = x * 8;
    const moveY = y * 6;
    const rotate = -32 + (x * 2.5);

    jointBg.style.transform = `translate(calc(-50% + ${moveX}px), calc(-50% + ${moveY}px)) rotate(${rotate}deg)`;
  });

  heroSection.addEventListener('mouseleave', () => {
    jointBg.style.transform = `translate(-50%, -50%) rotate(-32deg)`;
  });
}

// 3. Hero Typewriter Engine
function initTypewriter() {
  const target = document.getElementById('typewriterText');
  if (!target) return;

  const phrases = [
    "PAŠTICARTEL",
    "UNDERGROUND",
    "RAW SOUND // 2026"
  ];

  let phraseIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let typeSpeed = 100;

  function type() {
    const current = phrases[phraseIndex];

    if (isDeleting) {
      target.textContent = current.substring(0, charIndex - 1);
      charIndex--;
      typeSpeed = 40;
    } else {
      target.textContent = current.substring(0, charIndex + 1);
      charIndex++;
      typeSpeed = 90 + Math.random() * 30;
    }

    if (!isDeleting && charIndex === current.length) {
      typeSpeed = 2000;
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      phraseIndex = (phraseIndex + 1) % phrases.length;
      typeSpeed = 300;
    }

    setTimeout(type, typeSpeed);
  }

  type();
}

// 4. Parallel Content Loading
async function loadAllContent() {
  await Promise.all([loadDiscography(), loadRoster(), loadEvents()]);
}

// Discography Loader
async function loadDiscography() {
  const container = document.getElementById('discoContainer');
  try {
    const res = await fetch(`${API_BASE}/discography`);
    if (!res.ok) throw new Error("API Offline");
    const drops = await res.json();

    container.innerHTML = drops.map(item => {
      const coverSrc = item.cover_image.replace(/\.png$/i, '.jpg');

      return `
        <div class="disco-card">
          <div class="disco-art">
            <span class="art-badge">${escapeHtml(item.version)}</span>
            <img 
              src="${coverSrc}" 
              alt="${escapeHtml(item.title)}"
              class="pixel-art-img"
              onerror="this.src='${item.cover_image}'; this.onerror=() => { this.style.display='none'; };"
            />
          </div>
          <div class="disco-content">
            <div class="disco-title" title="${escapeHtml(item.title)}">${escapeHtml(item.title)}</div>
            <div class="disco-credits" title="${escapeHtml(item.credits || item.artist)}">${escapeHtml(item.credits || item.artist)}</div>
            <a href="${item.stream_url}" class="stream-link" target="_blank" rel="noopener">STREAM</a>
          </div>
        </div>
      `;
    }).join('');
  } catch (err) {
    container.innerHTML = `<div class="loader">Database offline. Start the backend server.</div>`;
  }
}

// Crew Loader
async function loadRoster() {
  const container = document.getElementById('rosterContainer');
  try {
    const res = await fetch(`${API_BASE}/roster`);
    if (!res.ok) throw new Error("API Offline");
    const crew = await res.json();

    container.innerHTML = crew.map(member => `
      <div class="member-card">
        <div>
          <div class="member-top">
            <span class="member-role">${escapeHtml(member.role)}</span>
            <span class="member-tag">${escapeHtml(member.tag)}</span>
          </div>
          <div class="member-name">${escapeHtml(member.name)}</div>
          <p class="member-desc">${escapeHtml(member.bio)}</p>
          <div class="member-badges">
            ${member.badges.map(b => `<span>${escapeHtml(b)}</span>`).join('')}
          </div>
        </div>
        <div class="member-links">
          ${member.instagram ? `<a href="${member.instagram}" class="member-link" target="_blank" rel="noopener">IG</a>` : ''}
          ${member.spotify ? `<a href="${member.spotify}" class="member-link" target="_blank" rel="noopener">SPOTIFY</a>` : ''}
        </div>
      </div>
    `).join('');
  } catch (err) {
    container.innerHTML = `<div class="loader">Crew unavailable.</div>`;
  }
}

// Events Loader
async function loadEvents() {
  const container = document.getElementById('eventsContainer');
  try {
    const res = await fetch(`${API_BASE}/events`);
    if (!res.ok) throw new Error("API Offline");
    const events = await res.json();

    container.innerHTML = events.map(e => `
      <div class="event-row">
        <div class="event-date">${escapeHtml(e.date)}</div>
        <div class="event-venue">${escapeHtml(e.venue)}</div>
        <div class="event-city">${escapeHtml(e.city)}</div>
        ${e.is_sold_out 
          ? `<span class="ticket-btn sold-out">Sold Out</span>`
          : `<a href="${e.ticket_url}" class="ticket-btn" target="_blank" rel="noopener">Tickets</a>`
        }
      </div>
    `).join('');
  } catch (err) {
    container.innerHTML = `<div class="loader">Dates unavailable.</div>`;
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}