/**
 * build.js — Recomp 360
 * Legge i file JSON in _data/ e aggiorna le pagine HTML
 * Viene eseguito automaticamente da Netlify ad ogni deploy
 */

const fs   = require('fs');
const path = require('path');

// ── Carica tutti i JSON ──────────────────────────────────
function loadJSON(filename) {
  try {
    return JSON.parse(fs.readFileSync(path.join('_data', filename), 'utf8'));
  } catch (e) {
    console.warn(`⚠️  Impossibile caricare ${filename}: ${e.message}`);
    return null;
  }
}

const contatti    = loadJSON('contatti.json');
const prova       = loadJSON('prova.json');
const orariSala   = loadJSON('sala_orari.json');
const corsi       = loadJSON('corsi_lista.json');
const testimonianze = loadJSON('testimonianze.json');

// ── Helper: aggiorna un file HTML ────────────────────────
function updateFile(filename, fn) {
  const filepath = path.join('.', filename);
  if (!fs.existsSync(filepath)) return;
  let html = fs.readFileSync(filepath, 'utf8');
  html = fn(html);
  fs.writeFileSync(filepath, html);
  console.log(`✅ Aggiornato: ${filename}`);
}

// ── 1. CONTATTI — telefono, indirizzo, email ─────────────
if (contatti) {
  const tel     = contatti.telefono;
  const telRaw  = tel.replace(/\s/g, '');  // per href="tel:"
  const addr    = contatti.indirizzo;
  const addrShort = addr.split(',')[0].trim(); // solo via, senza CAP/città

  // Genera HTML orari
  const orariHTML = contatti.orari
    .map(o => `${o.giorno}: ${o.orario}`)
    .join('<br>');

  const pages = ['index.html', 'metodo-recomp.html', 'sala-pesi.html', 'corsi-fitness.html'];

  pages.forEach(page => updateFile(page, html => {

    // Telefono nei link tel:
    html = html.replace(/href="tel:[0-9]+"/g, `href="tel:${telRaw}"`);

    // Telefono visibile
    html = html.replace(
      /(<a href="tel:[0-9]+"[^>]*>)[^<]+(<\/a>)/g,
      `$1${tel}$2`
    );

    // Telefono in testo semplice (non in link)
    html = html.replace(
      /(\bchiama il\s+)[\d\s]+/g,
      `$1${tel}`
    );
    html = html.replace(
      /(\bchiama il\s+[\d\s]+|0[0-9 ]+(?=<|\s*·|\s*\n))/g,
      (match) => match.startsWith('chiama') ? `chiama il ${tel}` : tel
    );

    // Indirizzo esteso
    html = html.replace(
      /Via Prenestina 278 B, 00177 Roma/g,
      addr
    );

    // Indirizzo corto (nei band/footer brevi)
    html = html.replace(/Via Prenestina 278B/g, addrShort);

    // Orari location section (index.html)
    html = html.replace(
      /<p>(Lun[^<]+(?:<br>[^<]+)*)<\/p>(\s*<\/div>\s*<\/div>\s*<div class="loc-item">\s*<div class="loc-icon">)/,
      `<p>${orariHTML}</p>$2`
    );

    // Footer indirizzo + telefono
    html = html.replace(
      /Via Prenestina [^·]+·[^<]+(?=<\/p>)/,
      `${addr} · ${tel}`
    );

    return html;
  }));
}

// ── 2. PROVA €17 — prezzo, ingressi, inclusi ────────────
if (prova) {
  const prezzo   = prova.prezzo;
  const ingressi = prova.ingressi;
  const giorni   = prova.giorni;
  const inclusi  = prova.inclusi;

  // Genera righe inclusi
  const inclusiHTML = inclusi.map(v =>
    `        <div class="price-row"><div class="price-dot"></div><span class="price-txt">${v}</span></div>`
  ).join('\n');

  // Genera righe inclusi per civetta (home)
  const civettaHTML = inclusi.map(v =>
    `    <div class="ci-item"><div class="ci-dot"></div><span class="ci-txt">${v}</span></div>`
  ).join('\n');

  const pages = ['index.html', 'metodo-recomp.html', 'corsi-fitness.html'];
  pages.forEach(page => updateFile(page, html => {

    // Prezzo
    html = html.replace(
      /(<span class="price-amount">)€[\d]+(<\/span>)/g,
      `$1€${prezzo}$2`
    );
    html = html.replace(
      /(<span class="price-big">)€[\d]+(<\/span>)/g,
      `$1€${prezzo}$2`
    );

    // Pulsante con prezzo
    html = html.replace(
      /ATTIVA ORA LA TUA PROVA — €[\d]+/g,
      `ATTIVA ORA LA TUA PROVA — €${prezzo}`
    );

    // Sostituisci le righe inclusi nel price-box
    html = html.replace(
      /(<div class="price-includes">)([\s\S]*?)(<\/div>\s*<a href[^>]+class="btn-primary)/g,
      (match, open, content, after) => {
        return `${open}\n${inclusiHTML}\n      ${after}`;
      }
    );

    // Giorni di validità nel testo
    html = html.replace(/Da consumare in \d+ giorni/g, `Da consumare in ${giorni} giorni`);
    html = html.replace(/14 giorni di tempo/g, `${giorni} giorni di tempo`);
    html = html.replace(/(\d+) giorni(?=<)/g, `${giorni} giorni`);

    return html;
  }));

  // Aggiorna civetta section in index.html
  updateFile('index.html', html => {
    html = html.replace(
      /(<div class="civetta-includes">)([\s\S]*?)(<\/div>\s*<div class="civetta-btns")/g,
      (match, open, content, after) => `${open}\n${civettaHTML}\n  ${after}`
    );
    return html;
  });
}

// ── 3. ORARI SALA PESI ───────────────────────────────────
if (orariSala) {
  updateFile('sala-pesi.html', html => {
    // Genera le righe orari
    const righeHTML = orariSala.orari.map(o => {
      if (o.chiuso) {
        return `    <div class="orari-row orari-closed"><span class="orari-giorno">${o.giorno}</span><span class="orari-ora">Chiuso</span></div>`;
      }
      return `    <div class="orari-row"><span class="orari-giorno">${o.giorno}</span><span class="orari-ora">${o.orario}</span></div>`;
    }).join('\n');

    // Sostituisci il blocco orari esistente
    html = html.replace(
      /(<div class="orari-grid">)([\s\S]*?)(<\/div>\s*\n\s*<\/section>)/,
      (match, open, content, after) => {
        // Mantieni l'ultima riga speciale con indirizzo se presente
        const addrRow = content.match(/<div class="orari-row"[^>]*style[^>]*>[\s\S]*?<\/div>/);
        return `${open}\n${righeHTML}\n${addrRow ? addrRow[0] + '\n' : ''}  ${after}`;
      }
    );

    return html;
  });
}

// ── 4. LISTA CORSI ───────────────────────────────────────
if (corsi) {
  updateFile('corsi-fitness.html', html => {
    const corsiHTML = corsi.corsi.map((corso, i) => {
      const bgImages = [
        'img/utente-squat-specchio.jpg',
        'img/utente-deadlift.jpg',
        'img/coach-area-funzionale.jpg',
        'img/coach-cliente-cable.jpg'
      ];
      const bg = bgImages[i] || bgImages[0];
      return `
      <div class="corso-card r d${i}">
        <div class="corso-card-img" style="background-image:url('${bg}')"></div>
        <div class="corso-card-body">
          <span class="corso-tag">${corso.categoria}</span>
          <h3 class="corso-nome">${corso.nome}</h3>
          <p class="corso-desc">${corso.descrizione}</p>
          <span class="corso-livelli">${corso.livelli}</span>
        </div>
      </div>`;
    }).join('\n');

    html = html.replace(
      /(<div class="corsi-grid">)([\s\S]*?)(<\/div>\s*\n\s*<\/section>)/,
      (match, open, content, close) => `${open}\n${corsiHTML}\n  ${close}`
    );

    return html;
  });
}

// ── 5. TESTIMONIANZE ─────────────────────────────────────
if (testimonianze) {
  updateFile('index.html', html => {
    const stelle = n => Array(n).fill('<div class="star"></div>').join('');

    const tcards = testimonianze.recensioni.map((r, i) => `
    <div class="tcard r d${i}">
      <div class="stars">${stelle(r.stelle)}</div>
      <p class="ttext">"${r.testo}"</p>
      <span class="tauthor">${r.autore}</span>
    </div>`).join('\n');

    html = html.replace(
      /(<div class="testi-grid">)([\s\S]*?)(<\/div>\s*\n\s*<\/section>)/,
      (match, open, content, close) => `${open}\n${tcards}\n  ${close}`
    );

    return html;
  });
}

console.log('\n🚀 Build completato!');
