MEGAVERKS — BLOWER, FAN, AHU SELECTION + TESTING + WARRANTY SYSTEM
====================================================================

PACKAGE CONTENTS
----------------
1. MEGAVERKS_Blower_Fan_AHU_Testing_Warranty.html  - Main offline web app
2. apps-script-backend.js                          - Google Apps Script backend
3. README.txt                                      - This file

WHAT THIS SYSTEM DOES
---------------------
7 Integrated Tabs:
  ⚙️ SISW        — 10 centrifugal blower models, 4P/6P, casing 35-75, Forward/Backward curve auto-recommendation, 10 orientations, CAD view
  🌀 Axial       — 21 models across 3 categories (Inbuilt Motors / Low CFM Leafs / High CFM Leafs), filter by dia/RPM/HP/phase/CFM, CAD view
  🔧 LLD         — 11 models (LLD 3.0 → 10.0), 300-1000mm impeller, belt/direct drive, double-inlet CAD view
  🏭 AHU         — MEGAVENTS AHU with Nicotra RDH fan selection, CF Soft V-belt drive sizing, pulley/belt/motor calculations, section picker, dimension calculator
  🧪 Testing     — Full testing quality form: rotation, drive type (pulley/V-belt toggle), static pressure, 4-point velocities (auto-averaged), CFM, motor HP/RPM, phase, vibration, noise dB, amps/voltage, remarks
  🛡️ Warranty    — Register warranty per product with auto-calculated expiry date. Dashboard shows Active / Expiring Soon (< 30 days) / Expired status with color coding
  📊 Board       — Leaderboard of all testing records, filterable by customer/engineer/date, exportable to CSV

GOOGLE SHEETS SYNC
------------------
All data syncs across devices via Google Sheets:
  • Customers        — Project info auto-loads when selecting customer name
  • Testing          — All testing quality records
  • Warranty         — Warranty registrations with expiry tracking
  • SISW/Axial/LLD   — Selections per customer
  • AHU              — AHU selections per customer

SETUP INSTRUCTIONS  (v1.1 — same Google Sheet, same script URL, same passcode as the Blower Selector)
------------------------------------------------------------------------------------------------------
Data is saved in the existing Google Sheet "BLOWERS ORIENTATION MEGAVERKS" through the existing
Apps Script web app. The script URL is BUILT INTO the app — nobody has to paste it.

ONLY STEP: UPDATE THE GOOGLE APPS SCRIPT (once)
1. Open the Apps Script project of "BLOWERS ORIENTATION MEGAVERKS" (Extensions → Apps Script).
2. Select ALL the code in Code.gs, delete it, and paste the ENTIRE new Code.gs
   (apps-script-backend.js in this folder is the same file). Click Save.
3. Choose "setup" in the function list and click Run (adds the new tabs: Customers, Testing,
   Warranty, SISW_Selections, Axial_Selections, LLD_Selections, AHU). Allow permissions if asked.
4. Deploy → MANAGE DEPLOYMENTS → ✏️ (edit) → Version: "New version" → Deploy.
   IMPORTANT: do NOT use "New deployment" — that creates a different URL.

PASSCODE / ADMIN PIN / SCRIPT URL  (one set for all logins and both apps)
- Kept in the "App Settings" tab of the sheet: Passcode, Admin PIN, Script URL.
- Every device asks for the team passcode once (the Blower Selector and this app share it).
- 🔑 Change Passcode / 🛡️ Change PIN buttons (orange bar) — need the admin PIN; saved in the sheet;
  all other devices are asked for the new passcode automatically.
- 💾 Save URL for all — paste a new /exec URL in the orange bar, enter the admin PIN; it is saved in
  the sheet and every device switches to it. Or type it in the "Script URL" row of App Settings.
- 🔒 Lock — locks this device (both apps).
- Prices are hidden in the app (Axial tab).

HOW TO USE
----------

PROJECT INFO
- Fill Engineer Name, Customer Name, Project details
- Click "Save Customer" to store locally
- Click "Save to Sheets" to backup to Google Sheets
- When you type/select a customer name that exists, it auto-loads their data

SISW / AXIAL / LLD TABS
- Select blowers/fans using filters and tables
- CAD views auto-generate based on selection
- Orientations can be selected visually

AHU TAB
- Enter CFM, SP, motor specs
- Fan auto-recommends from Nicotra RDH database
- Click "Calculate Selection" to get pulley, belt, motor sizing per CF Soft method
- Select sections (louver, filter, coil, fan, etc.)
- AHU dimensions auto-calculate based on face velocity and site constraints

TESTING TAB
- Select customer from dropdown
- Fill all testing fields
- 4-point velocities auto-average
- Click "Save to Google Sheets" to backup
- Data auto-loads when you select a customer

WARRANTY TAB
- Select customer, product type, model, serial number
- Enter supply date and warranty period (3/6/12/18/24/36/60 months)
- Expiry date auto-calculates
- Status shows: ACTIVE (green) / EXPIRING SOON (orange, <30 days) / EXPIRED (red)
- Dashboard filters by status, customer, product type

LEADERBOARD TAB
- Shows all testing records in a sortable table
- Filter by customer, engineer, date range
- Export to CSV
- Load from Sheets to merge cloud + local data

CROSS-DEVICE SYNC
-----------------
- The app works fully offline using browser localStorage
- Google Sheets sync is optional but recommended for cross-device access
- If no internet, data stays in localStorage
- When connection returns, click "Sync All" to push everything to the cloud
- On a new device, open the link, enter the passcode and click "Load All" to pull all data

GOOGLE SHEETS STRUCTURE (Auto-created)
--------------------------------------
- Customers        : All customer/project info
- Testing          : All testing quality records
- Warranty         : All warranty registrations
- SISW_Selections  : SISW blower selections
- Axial_Selections : Axial fan selections
- LLD_Selections   : LLD blower selections
- AHU              : AHU selections

OFFLINE MODE
------------
- Fully functional without internet
- All selections, testing, warranty data stored in browser localStorage
- Google Sheets sync happens only when you explicitly click sync buttons
- Open the GitHub link in any browser; enter the team passcode once per device

TROUBLESHOOTING
---------------
- "Unknown action … out of date" → the Apps Script still has the old code: paste the new Code.gs and redeploy (step 4)
- "Wrong passcode" → check the Passcode in the App Settings tab of the sheet
- "Connection failed" → Check deployment is set to "Anyone" (not "Only myself")
- Data not loading → Customer name must match exactly (case-sensitive in Sheets)
- CORS errors → Ensure Apps Script is deployed as "Web App", not "API Executable"
- Sync lag → Google Sheets has ~1-2 second latency; localStorage is instant

BROWSER SUPPORT
---------------
- Chrome, Edge, Firefox, Safari — all supported
- For mobile: save HTML to phone, open in browser
- Recommended: Chrome desktop for best performance

IMPORTANT NOTES
---------------
- The HTML file is fully self-contained — no external dependencies
- All CSS and JavaScript is embedded inline
- Print-optimized CSS included — use Ctrl+P for clean output
- WhatsApp share encodes the full summary text
- Email share opens your default mail client with pre-filled subject/body

SUPPORT
-------
For issues or feature requests, contact your system administrator.
All Google Sheets access needs the team passcode. Keep the passcode and admin PIN private.
