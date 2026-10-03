# Megaverks Blower Selector

Single-page blower selection tool for Megaverks Technologies. It does the following:

- Captures customer, site and engineer details.
- Selects the blower: Exhaust or Fresh Air, model, discharge form and accessories.
- Generates an A4 PDF and shares it on WhatsApp in one tap.
- Saves every selection to Google Sheets, so the whole team sees the same history and leaderboard.

| File | Where it goes |
|---|---|
| `index.html` | GitHub repository (served by GitHub Pages) |
| `Code.gs` | Google Sheet → Extensions → Apps Script |

---

## 1. Google Sheet + Apps Script (about 5 minutes)

1. Create a new Google Sheet, for example **Megaverks Blower DB**.
2. Open **Extensions → Apps Script**. Delete the sample code and paste all of `Code.gs`.
3. At the top of the script, change these two values:
   - `API_TOKEN`: any secret word. The same word goes into `index.html`.
   - `ADMIN_PIN`: needed to edit the blower / casing list or delete records.
4. Click **Save**. Choose `setup` in the function dropdown and click **Run**. Approve the Google permissions; the script needs Sheets and Drive.
   - This creates four tabs: *Blower Selections*, *Blower Master*, *Casing Sizes* and *_Health*.
   - It also creates the Drive folder *Megaverks Blower Selections*, where the PDFs are stored.
5. Click **Deploy → New deployment**, then the ⚙ icon, then **Web app**.
   - Execute as: **Me**
   - Who has access: **Anyone**
   - Click **Deploy** and copy the **Web app URL**. It ends in `/exec`.

> **Updating the script later:** use **Deploy → Manage deployments → ✎ Edit → Version: New version → Deploy**.
> The URL stays the same. If you create a *new* deployment instead, you get a new URL.

## 2. Configure the page

Open `index.html` and edit the `CONFIG` block near the top of the `<script>`:

```js
API_URL: 'https://script.google.com/macros/s/XXXXXXXX/exec',
API_TOKEN: 'megaverks-2026',   // same as API_TOKEN in Code.gs
```

With this set, anyone who opens the page is connected straight away and sees all saved history.

## 3. Publish on GitHub Pages

1. Create a GitHub repository, for example `blower-selector`, and upload `index.html`.
2. Go to **Settings → Pages → Build and deployment**. Choose **Deploy from a branch**, then branch `main` and folder `/ (root)`, and click **Save**.
3. After about a minute the page is live at `https://<your-username>.github.io/blower-selector/`.

## 4. Test

1. Open the page and go to **Settings → ▶ Test connection**. The test checks four things:
   - the URL format,
   - that the script is reachable and the token is accepted,
   - that the sheet can be read,
   - that the sheet can be written (and Drive reached).
2. If all four steps show ✓, the green **Connected** dot appears in the header.

---

## Using it

- **Save to cloud** writes the selection to the sheet and saves the PDF in Drive.
  - If the internet drops, the selection is kept on the phone and synced automatically later. It shows as "Pending".
- **PDF** downloads the A4 selection sheet.
- **WhatsApp**:
  - **Customer / Site engineer / Electrician** opens WhatsApp to that number. The message includes the details, the Drive PDF link and a link that reopens the record.
  - **Choose…** on a phone shares the PDF file itself through the share sheet.
- **History** shows totals, the engineer leaderboard and a searchable list. Tap **Open** to load a record back into the form with every field auto-filled.
- **Duplicate** copies a record as a new selection, for repeat customers.
- Typing a known customer name or phone number offers to fill the customer and site details from the last selection.
- **Settings → Copy setup link** produces a link that connects a teammate's phone in one tap.
- **No prices or costs** are shown anywhere: not in the page, the PDF, WhatsApp or the sheet.
- **Casing sizes:** picking a blower fills its casing size, and the page immediately shows:
  - **Inlet (round) Ø** = casing × 10 mm (50 casing → Ø500 mm)
  - **Blower outlet W × D** = 75 % × 100 % of the casing Ø (50 casing → 375 × 500 mm)
  - **Duct outlet** = the standard square duct (50 → 500 × 500, 55 → 550 × 550, 60 → 700 × 700). It is pre-filled but **editable**, and *Use standard size* puts it back.
- The **blower list** and **casing table** live in the *Blower Master* and *Casing Sizes* tabs. Edit them in Settings (needs the Admin PIN) or directly in the sheet.

## Good to know

- The **JSON** column in *Blower Selections* is the master copy of each record. The other columns are a readable mirror for filtering and reports. Edits made directly in those columns are not read back by the page; edit in the page instead.
- **Security:**
  - A public GitHub repo exposes `API_URL` and `API_TOKEN` to anyone who reads the code, and customer phone numbers and addresses are readable through that link.
  - For tighter control, leave `API_URL` blank in the file and give the team the **setup link** instead. Change `API_TOKEN` if it ever leaks; update it in both files and redeploy.
- The engineering check uses rules of thumb: 60 % fan efficiency, 15 % motor margin and a 5–12.5 m/s duct velocity band. Treat it as a sanity check, not as fan-curve selection.

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

\* Standard duct not specified yet: it defaults to casing Ø square. Correct it once in **Settings → Casing sizes** and it applies for everyone.
Outlet W is rounded to the nearest mm (337.5 → 338, 412.5 → 413).
