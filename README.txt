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

SETUP INSTRUCTIONS
------------------

STEP 1: CREATE GOOGLE SHEET
---------------------------
1. Open Google Drive → New → Google Sheets
2. Name it "MEGAVERKS Blower Database"
3. Leave the first sheet empty — Apps Script will auto-create all sheets

STEP 2: ADD GOOGLE APPS SCRIPT
------------------------------
1. In your Google Sheet, go to Extensions → Apps Script
2. Delete the default myFunction() code
3. Copy the ENTIRE contents of "apps-script-backend.js" into the editor
4. Save the project (Ctrl+S or click the disk icon)
5. Click "Deploy" → "New deployment"
6. Type: Web app
7. Execute as: Me
8. Who has access: Anyone
9. Click "Deploy" and authorize all permissions (click through warnings)
10. Copy the Web App URL (looks like: https://script.google.com/macros/s/XXXXXXXX/exec)

STEP 3: CONNECT THE HTML APP
----------------------------
1. Open "MEGAVERKS_Blower_Fan_AHU_Testing_Warranty.html" in any browser
2. In the orange settings bar at the top, paste your Web App URL
3. Click "Test" → status turns green "● Online"
4. The app now syncs with Google Sheets in real-time

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
- On a new device, paste the same GAS URL and click "Load All" to pull all data

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
- No server required — open the HTML file directly in any browser

TROUBLESHOOTING
---------------
- "No GAS URL" → Paste your Apps Script Web App URL in the orange settings bar
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
Keep your Google Apps Script URL private — it controls access to your data.
