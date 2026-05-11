# GUIDA — Attivare il pannello CMS su Netlify
## Per Maurizio — Setup una tantum (10 minuti)

---

## PASSO 1 — Deploy del sito aggiornato

1. Vai su **app.netlify.com**
2. Apri il sito recomp360
3. Trascina la cartella `recomp360` (quella con tutti i file) nella sezione Deploy
4. Aspetta che il deploy finisca (1-2 minuti)

---

## PASSO 2 — Attivare Netlify Identity

1. Nel pannello Netlify, vai su **Identity** (menù in alto)
2. Clicca **"Enable Identity"**
3. Vai in **Settings → Registration**
4. Seleziona **"Invite only"** (così solo chi inviti può accedere)
5. Vai in **Settings → Services → Git Gateway**
6. Clicca **"Enable Git Gateway"** ← FONDAMENTALE per il CMS

---

## PASSO 3 — Invitare Nicolò e Ahmed

1. Sempre nella sezione **Identity**, clicca **"Invite users"**
2. Inserisci le email:
   - nicolò@recomp360.it (sostituisci con la sua email reale)
   - ahmed@recomp360.it (sostituisci con la sua email reale)
3. Riceveranno un'email con un link per impostare la password
4. Dopo aver impostato la password, potranno accedere a:
   **https://recomp360.netlify.app/admin**

---

## COME USARE IL CMS (per Nicolò/Ahmed)

1. Vai su: **recomp360.netlify.app/admin**
2. Accedi con email e password
3. Nel pannello trovi tutto organizzato:

| Sezione | Cosa puoi modificare |
|---|---|
| ⚙️ Contatti e orari | Telefono, indirizzo, orari apertura |
| 💪 Offerta €17 | Prezzo, ingressi, cosa è incluso |
| 🏠 Home Page | Titolo hero, chi siamo, testimonianze |
| 🏋️ Metodo Recomp | Testi pagina metodo, step del processo |
| 🏗️ Sala Pesi | Testi, orari sala, zone attrezzatura |
| 🧘 Corsi Fitness | Lista corsi, descrizioni |

4. Modifica il campo → clicca **"Pubblica"** → le modifiche vanno live entro 1-2 minuti

---

## ⚠️ NOTA IMPORTANTE

Il CMS attuale gestisce i **dati JSON** (orari, testi, prezzi).
Le pagine HTML leggono ancora quei dati staticamente — per il prossimo step
si può collegare il CMS alle pagine HTML tramite un piccolo script di build.

Per ora il flusso è:
- Cliente modifica nel CMS
- I file JSON si aggiornano
- Maurizio applica le modifiche HTML quando necessario (o si automatizza con uno script)

---

## SUPPORTO

Per problemi: documentazione ufficiale su **decapcms.org**
