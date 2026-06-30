# −10 · drumul meu

Aplicație personală de slăbit (PWA). Funcționează **complet offline**,
se instalează pe **iPhone (Safari)** și **Android (Chrome)**, **fără backend, fără cont**,
toate datele rămân pe telefonul tău (localStorage). Ton blând, fără rușine.

> Spre greutatea ta țintă, în ritmul tău — ca să fii un părinte plin de energie, prezent mulți ani. 💚

> **Datele tale personale nu sunt în acest cod.** La prima pornire îți completezi
> singur cifrele (vârstă, greutate, talie/burtă, analize) — ele rămân doar pe
> telefonul tău, niciodată în acest repository.

---

## Ce conține

- **AZI** — linia motivațională a zilei, % complet, post 16:8 cu „Scurtează postul azi",
  contoare proteine/apă/pași, antrenamentul zilei, somn, alcool, suplimente, butonul
  **„Moment greu"** (reframe calmant + gustare proteică), contor opțional de țigări.
- **SĂPTĂMÂNĂ** — grila Lu–Du: Forță / Sport / Odihnă, ziua de răsfăț și de cântar.
- **PROGRES** — grafic de greutate (SVG desenat manual, zero dependențe), % spre 70 kg,
  dată estimată de final, serie curentă, talie & burtă, cardul **Sănătate** (analize) cu direcție.
- **JURNAL** — cântărire, talie/burtă, editare „de ce", fereastră de mâncare, zile de forță,
  **export/import** JSON, blocare cu **PIN**.

Toate valorile tale sunt pre-completate. Le poți schimba în codul din `index.html`
(caută obiectele `CONFIG` și `S` — sus de tot, comentate).

---

## Publicare pe GitHub Pages (pas cu pas)

1. Creează un repo nou pe GitHub, ex. `minus10` (poate fi **privat**).
2. Pune **toate fișierele din acest folder în rădăcina repo-ului** (nu într-un subfolder):
   ```
   index.html
   manifest.json
   service-worker.js
   icon-192.png
   icon-512.png
   apple-touch-icon.png
   make-icons.js   (opțional — doar ca să regenerezi iconițele)
   README.md
   ```
3. Din terminal, în acest folder:
   ```bash
   git init
   git add .
   git commit -m "Minus 10 — prima versiune"
   git branch -M main
   git remote add origin https://github.com/UTILIZATORUL-TAU/minus10.git
   git push -u origin main
   ```
4. Pe GitHub: **Settings → Pages → Build and deployment → Source: „Deploy from a branch"**,
   alege **branch `main`** și folder **`/ (root)`**, apasă **Save**.
5. După ~1 minut, aplicația e live la:
   `https://UTILIZATORUL-TAU.github.io/minus10/`

> Funcționează „as-is": căile sunt relative (`./`), deci merge din orice sub-folder.

### Când faci o actualizare
Schimbă conținutul, apoi în `service-worker.js` **mărește numărul versiunii**
(`minus10-v1` → `minus10-v2`) și fă `git push`. La următoarea deschidere, aplicația
îți arată „**O actualizare e gata → Reîmprospătează**". Nu rămâi blocat pe o versiune veche.

---

## Instalare pe telefon („Add to Home Screen")

### iPhone (Safari) — obligatoriu **Safari**, nu Chrome
1. Deschide `https://UTILIZATORUL-TAU.github.io/minus10/` în **Safari**.
2. Apasă butonul **Share** (pătrat cu săgeată în sus).
3. Derulează și alege **„Add to Home Screen" / „Adaugă pe ecranul principal"**.
4. Apasă **Add**. Apare iconița verde cu săgeata; o deschizi ca pe orice aplicație,
   pe tot ecranul, fără bara de browser. Funcționează și fără internet.

### Android (Chrome)
1. Deschide linkul în **Chrome**.
2. Meniul **⋮** (dreapta sus) → **„Install app" / „Instalează aplicația"**
   (sau bannerul „Add to Home screen" dacă apare).
3. Confirmă **Install**. Iconița ajunge în sertarul de aplicații.

După instalare, deschide-o o dată cât ai internet ca să se salveze offline. Apoi merge oriunde.

---

## Datele tale & siguranță

- Tot ce loghezi stă în `localStorage`, pe telefonul tău. Nimic nu pleacă nicăieri.
- Există o **a doua copie-oglindă** automată, plus dată „ultima copie de siguranță".
- Folosește **Jurnal → Exportă** din când în când și trimite-ți fișierul `.json` pe email —
  e plasa ta de siguranță dacă schimbi telefonul. Recuperezi cu **Importă**.
- Structura datelor are `schemaVersion` + migrare defensivă: actualizările viitoare
  **nu îți șterg istoricul**.
- Opțional, blochează aplicația cu **PIN** (sunt date de sănătate).

---

## Regenerarea iconițelor (opțional)

Iconițele PNG sunt deja generate. Dacă vrei să le schimbi designul, editează
`make-icons.js` și rulează (ai nevoie doar de Node, fără pachete):

```bash
node make-icons.js
```

---

## ⚠️ Disclaimer

Asta **nu** e sfat medical. Vorbește cu medicul de familie înainte de un deficit caloric
sau suplimente. Și **niciodată** nu schimba medicația psihiatrică fără psihiatrul tău.
Aplicația e gândită să fie blândă tocmai pentru că anxietatea și unele medicații
îți pot crește pofta — asta nu e o slăbiciune de voință.
