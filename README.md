# Megaverks Blower Selector

Blower selection app for Megaverks Technologies, covering Exhaust and Fresh Air. It does the following:

- Shows casing sizes with the inlet, outlet and an editable duct outlet.
- Generates a PDF and shares it on WhatsApp in one tap.
- Saves every selection to Google Sheets.
- Shows a history and an engineer leaderboard.
- Each saved selection has its own link that reopens it with every detail filled in.

| File | Where it goes |
|---|---|
| `index.html` | GitHub repo (the app) |
| `config.js` | GitHub repo: holds the Google script URL (one line) |
| `Code.gs` | Google Sheet → Extensions → Apps Script |
| `README.md` | GitHub repo (these instructions) |

---

## Step 1: Google Sheet + script (about 5 minutes)

The sheet **Megaverks Blower DB** already exists in punith.r111@gmail.com's Google Drive, and its script editor already contains the code.

1. Open **Megaverks Blower DB** in Google Sheets, then **Extensions → Apps Script**.
2. Check that the editor shows the code starting with `MEGAVERKS TECHNOLOGIES — Blower Selector backend … v1.2`.
   - If it doesn't, select everything, delete it and paste the whole of `Code.gs`.
3. Click **💾 Save**.
4. Choose **setup** in the function dropdown next to *Debug*, then click **▶ Run**.
5. Google asks for permission:
   - Click **Review permissions** and choose your account.
   - Click **Advanced → Go to (project) (unsafe)** and then **Allow**.
   - This is normal for your own script.
6. Click **Deploy → New deployment → ⚙ Select type → Web app**.
   - **Execute as:** Me
   - **Who has access:** Anyone
   - Click **Deploy** and **copy the Web app URL**. It ends in `/exec`.
7. Back in the sheet, open the **App Settings** tab. It shows your **Passcode** (for the team) and **Admin PIN** (for you).

## Step 2: Upload to GitHub (about 2 minutes)

1. Open your repo, for example **BLOWER-ORIENTATION-MEGAVERKS-**, and choose **Add file → Upload files**.
2. Drop in `index.html`, `config.js` and `README.md`, then click **Commit changes**. This replaces the old `index.html`.
3. In the repo, click **config.js → ✏️ Edit** and paste the `/exec` URL between the quotes:
   ```js
   API_URL: 'https://script.google.com/macros/s/XXXXXXXX/exec'
   ```
4. Click **Commit changes**. GitHub Pages updates in about a minute.

## Step 3: Use it

1. Open **https://punith112.github.io/BLOWER-ORIENTATION-MEGAVERKS-/** and enter the **passcode** once on each phone.
2. Save a selection. It goes into the sheet's **Blower Selections** tab with an **Open Link**. Opening that link on any phone, after the passcode, shows the full selection again.
3. **Settings → ▶ Test connection** checks four things: the URL, the passcode, reading and writing.
4. **Settings → 🔒 Lock this device** asks for the passcode again on that phone.

### Passcode & PIN
- They live **only** in the sheet's **App Settings** tab, not in the GitHub code.
- To change them, type a new value there. Every phone is then asked for the new passcode.
- The **Admin PIN** is needed to edit the blower and casing lists or to delete a saved selection.

### Selections made before this update
These were saved only on the phone that made them, shown as "Pending". Open the updated app on that phone and enter the passcode, and they upload to the sheet automatically.

### Updating the script later
Use **Deploy → Manage deployments → ✏️ → Version: New version → Deploy**. This keeps the same URL, so `config.js` doesn't change.

---

## Casing table (standard list)

| Blower | Casing | Inlet Ø (mm) | Blower outlet W × D (mm) | Std duct outlet (mm) |
|---|---|---|---|---|
| 2 HP / 1440 | 30 | 300 | 225 × 300 | 300 × 300 * |
| 3 HP / 1440 | 40 | 400 | 300 × 400 | 400 × 400 * |
| 3 HP / 960, 5 HP / 1440 | 45 | 450 | 338 × 450 | 450 × 450 * |
| 5 HP / 960, 7.5 HP / 1440 | 50 | 500 | 375 × 500 | 500 × 500 |
| 7.5 HP / 960 | 55 | 550 | 413 × 550 | 550 × 550 |
| 10 HP / 1440 | 60 | 600 | 450 × 600 | 700 × 700 |
| 10 HP / 960 | 70 | 700 | 525 × 700 | 700 × 700 * |

- **How sizes are worked out:** inlet Ø is the casing number × 10 mm. The blower outlet is 75 % × 100 % of the casing Ø. Outlet W is rounded to the nearest mm.
- **Duct sizes marked \*:** these defaults are the casing Ø square, because no standard duct size was given. Correct them once in **Settings → Casing sizes** (needs the Admin PIN) and they apply for everyone.
- **Prices:** none are shown anywhere in the app, PDF, WhatsApp message or sheet.
