/**
 * MEGAVERKS TECHNOLOGIES — combined backend (Google Apps Script)  v2.0
 *   • Blower Selector            (index.html)
 *   • Blower / Fan / AHU + Testing + Warranty system (MEGAVERKS_Blower_Fan_AHU_Testing_Warranty.html)
 * Both apps use the SAME sheet, the SAME passcode and the SAME admin PIN (App Settings tab).
 * --------------------------------------------------------------------------
 * Paste this whole file into Extensions → Apps Script of your Google Sheet,
 * run setup() once, then Deploy → New deployment → Web app
 *   Execute as: Me      Who has access: Anyone
 * The /exec URL is built into index.html (CONFIG.API_URL).
 *
 * Tabs created:  Blower Selections · Blower Master · Casing Sizes · App Settings · _Health
 *                Customers · Testing · Warranty · SISW_Selections · Axial_Selections · LLD_Selections · AHU
 * The team PASSCODE and ADMIN PIN live ONLY in the "App Settings" tab of the sheet
 * (setup() generates them). Change them there at any time — no code change needed.
 * The JSON column is the master copy of every record; the other columns are a
 * readable mirror for viewing/filtering in Sheets. No prices are stored.
 */

const SPREADSHEET_ID = '1XInLc249V3LFLcKDoPVxwSrJ_ezZmUx4gDywjoJw0rE';   // Google Sheet "BLOWERS ORIENTATION MEGAVERKS" (same sheet as before)
const SHEET_RECORDS = 'Blower Selections';
const SHEET_BLOWERS = 'Blower Master';
const SHEET_CASINGS = 'Casing Sizes';
const SHEET_HEALTH = '_Health';
const SHEET_SETTINGS = 'App Settings';
const DRIVE_FOLDER = 'Megaverks Blower Selections';
const VERSION = '2.0.0';
const MAX_LIST = 1000;

const HEADERS = [
  'ID', 'Created', 'Updated', 'Application', 'Customer Name', 'Customer Phone',
  'Customer Email', 'Customer Address', 'Site Address', 'Site Electrician',
  'Site Engineer', 'Megaverks Engineer', 'Blower Model', 'Motor HP', 'RPM',
  'Casing Size', 'Inlet Dia mm', 'Blower Outlet mm', 'Duct Outlet mm',
  'Airflow CFM', 'Static Pressure mmWC', 'Discharge Form', 'Drive Arrangement',
  'Material', 'Damper', 'Canvas', 'Filters', 'Qty', 'Open Link', 'PDF URL', 'JSON'
];
const COL = {}; HEADERS.forEach(function (h, i) { COL[h] = i; });

const BLOWER_HEADERS = ['ID', 'Label', 'HP', 'RPM', 'Casing', 'Active'];
const CASING_HEADERS = ['Casing', 'Inlet Dia mm', 'Outlet W mm', 'Outlet D mm', 'Duct W mm', 'Duct H mm'];
const DEFAULT_BLOWERS = [
  ['2HP-1440', '2 HP', 2, 1440, 35, true],
  ['3HP-1440', '3 HP', 3, 1440, 40, true],
  ['3HP-960', '3 HP', 3, 960, 45, true],
  ['5HP-1440', '5 HP', 5, 1440, 45, true],
  ['5HP-960', '5 HP', 5, 960, 50, true],
  ['7.5HP-1440', '7.5 HP', 7.5, 1440, 50, true],
  ['7.5HP-960', '7.5 HP', 7.5, 960, 55, true],
  ['10HP-1440', '10 HP', 10, 1440, 55, true],
  ['10HP-960', '10 / 12.5 HP', 12.5, 960, 70, true],
  ['15HP-960', '15 HP', 15, 960, 75, true]
];
// Inlet Ø = casing x 10 mm · outlet W = 75 % of casing Ø · outlet D = 100 % · duct = standard square duct
const STD_DUCT = { 50: 500, 55: 550, 60: 700 };
function casingFormula_(c) {
  var d = Number(c) * 10, duct = STD_DUCT[Number(c)] || d;
  return [Number(c), d, Math.round(d * 0.75), d, duct, duct];
}
const DEFAULT_CASINGS = [35, 40, 45, 50, 55, 60, 70, 75].map(casingFormula_);

/* ------------------------------------------------------------------ entry */
function doGet(e) {
  return respond_(e && e.parameter ? e.parameter : {});
}

function doPost(e) {
  var body;
  try {
    body = JSON.parse((e && e.postData && e.postData.contents) || '{}');
  } catch (err) {
    return out_({ ok: false, success: false, error: 'Request body is not valid JSON' });
  }
  return respond_(body || {});
}

function respond_(p) {
  try {
    return out_(route_(p));
  } catch (err) {
    return out_({ ok: false, success: false, error: String((err && err.message) || err) });
  }
}

function route_(p) {
  var action = String(p.action || 'ping');
  var st = appSettings_();
  if (!st.pass) return { ok: false, success: false, error: 'No passcode set — fill "Passcode" in the App Settings tab of the sheet', code: 'AUTH' };
  if (String(p.pass || '').trim() !== st.pass) {
    try { Utilities.sleep(800); } catch (e) { /* slow down guessing */ }
    return { ok: false, success: false, error: 'Wrong passcode', code: 'AUTH' };
  }
  switch (action) {
    case 'ping': return ping_(st);
    case 'list': return list_(p.limit);
    case 'get': return get_(p.id);
    case 'save': return save_(p.record, p.pdfBase64, linkBase_(st, p.appUrl));
    case 'master': return { ok: true, master: readMaster_() };
    case 'saveMaster': requirePin_(p.pin, st); return saveMaster_(p.master);
    case 'delete': requirePin_(p.pin, st); return delete_(p.id);
    case 'auth': requirePin_(p.pin, st); return { ok: true };
    case 'selftest': return selftest_(p.checkDrive);
    // ---- admin: change passcode / PIN / script URL (saved in App Settings, applies to all logins)
    case 'changePasscode': requirePin_(p.pin, st); return changeSetting_('Passcode', p.newPass, st);
    case 'changePin': requirePin_(p.pin, st); return changeSetting_('Admin PIN', p.newPin, st);
    case 'setScriptUrl': requirePin_(p.pin, st); return setScriptUrl_(p.url);
    // ---- Blower / Fan / AHU + Testing + Warranty system
    case 'getCustomers': return getCustomers(ss_());
    case 'getTesting': return getTesting(ss_(), p.customer || '');
    case 'getAllTesting': return getAllTesting(ss_());
    case 'getCustomerData': return getCustomerData(ss_(), p.name || '');
    case 'getSelections': return getSelections(ss_(), p.customer || '');
    case 'getAllWarranty': return getAllWarranty(ss_());
    case 'saveCustomer': return locked_(function () { return saveCustomer(ss_(), p); });
    case 'saveTesting': return locked_(function () { return saveTesting(ss_(), p); });
    case 'saveWarranty': return locked_(function () { return saveWarranty(ss_(), p); });
    case 'saveSelection': return locked_(function () { return saveSelection(ss_(), p); });
    case 'saveAHU': return locked_(function () { return saveAHU(ss_(), p); });
    default: return { ok: false, success: false, error: 'Unknown action: ' + action };
  }
}

function out_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function requirePin_(pin, st) {
  st = st || appSettings_();
  if (!st.pin || String(pin || '').trim() !== st.pin) throw new Error('Wrong admin PIN');
}

/* ------------------------------------------- passcode, PIN & app link (sheet) */
function rand6_() { return String(Math.floor(100000 + Math.random() * 900000)); }

function appSettings_() {
  var cache = null;
  try { cache = CacheService.getScriptCache(); var hit = cache.get('mv_settings'); if (hit) return JSON.parse(hit); } catch (e) { cache = null; }
  var sh = sheet_(SHEET_SETTINGS, ['Setting', 'Value', 'Notes']);
  var have = {};
  if (sh.getLastRow() >= 2) sh.getRange(2, 1, sh.getLastRow() - 1, 2).getValues().forEach(function (r) { if (r[0] !== '') have[String(r[0]).trim()] = String(r[1]).trim(); });
  var add = [];
  if (!('Passcode' in have)) { have['Passcode'] = rand6_(); add.push(['Passcode', have['Passcode'], 'Team passcode to open the Blower Selector (change any time)']); }
  if (!('Admin PIN' in have)) { var pin = rand6_(); while (pin === have['Passcode']) pin = rand6_(); have['Admin PIN'] = pin; add.push(['Admin PIN', pin, 'Needed to edit the blower / casing list or delete records']); }
  if (!('App Link' in have)) { have['App Link'] = ''; add.push(['App Link', '', 'Web address of the app — filled automatically on first save']); }
  if (!('Script URL' in have)) { have['Script URL'] = ''; add.push(['Script URL', '', 'Apps Script /exec URL used by both apps — leave blank to use the one built into the apps']); }
  if (add.length) { var rg = sh.getRange(sh.getLastRow() + 1, 1, add.length, 3); rg.setNumberFormat('@'); rg.setValues(add); }
  var out = { pass: have['Passcode'] || '', pin: have['Admin PIN'] || '', appLink: have['App Link'] || '', scriptUrl: have['Script URL'] || '' };
  try { if (cache) cache.put('mv_settings', JSON.stringify(out), 60); } catch (e) { /* ignore */ }
  return out;
}

// Writes one row of the App Settings tab (keeps leading zeros) and refreshes the cache.
function writeSetting_(name, value) {
  var sh = sheet_(SHEET_SETTINGS, ['Setting', 'Value', 'Notes']);
  var last = sh.getLastRow();
  var rows = last >= 2 ? sh.getRange(2, 1, last - 1, 1).getValues() : [];
  var r = -1;
  for (var i = 0; i < rows.length; i++) if (String(rows[i][0]).trim() === name) { r = i + 2; break; }
  if (r < 0) { r = last + 1; sh.getRange(r, 1, 1, 1).setValues([[name]]); }
  var cell = sh.getRange(r, 2, 1, 1);
  cell.setNumberFormat('@');
  cell.setValues([[value]]);
  clearSettingsCache_();
}

function changeSetting_(name, value, st) {
  var v = String(value == null ? '' : value).trim();
  var label = name === 'Passcode' ? 'passcode' : 'admin PIN';
  if (!/^[A-Za-z0-9]{4,20}$/.test(v)) return { ok: false, success: false, error: 'New ' + label + ' must be 4–20 letters or digits' };
  if (name === 'Passcode' && v === st.pin) return { ok: false, success: false, error: 'Passcode must be different from the admin PIN' };
  if (name === 'Admin PIN' && v === st.pass) return { ok: false, success: false, error: 'Admin PIN must be different from the passcode' };
  var lock = LockService.getScriptLock();
  lock.waitLock(25000);
  try { writeSetting_(name, v); } finally { lock.releaseLock(); }
  return { ok: true, success: true, changed: name };
}

function setScriptUrl_(url) {
  var u = String(url == null ? '' : url).trim();
  if (u && !/^https:\/\/script\.google\.com\/(a\/[^\/\s]+\/)?macros\/s\/[A-Za-z0-9_-]{20,}\/exec$/.test(u)) return { ok: false, success: false, error: 'Not a valid Apps Script /exec URL' };
  var lock = LockService.getScriptLock();
  lock.waitLock(25000);
  try { writeSetting_('Script URL', u); } finally { lock.releaseLock(); }
  return { ok: true, success: true, scriptUrl: u };
}

function locked_(fn) {
  var lock = LockService.getScriptLock();
  lock.waitLock(25000);
  try { return fn(); } finally { lock.releaseLock(); }
}

function clearSettingsCache_() { try { CacheService.getScriptCache().remove('mv_settings'); } catch (e) { /* ignore */ } }

// Simple trigger: editing the App Settings tab takes effect immediately
function onEdit(e) {
  try { if (e && e.range && e.range.getSheet().getName() === SHEET_SETTINGS) clearSettingsCache_(); } catch (err) { /* ignore */ }
}

// Base web address used for the "Open Link" column. Remembers the app's address on first use.
function linkBase_(st, appUrl) {
  if (st.appLink) return st.appLink;
  var u = String(appUrl || '').trim();
  if (!/^https:\/\/[^\s"'<>]{4,300}$/.test(u) && !/^http:\/\/localhost[:\/][^\s"'<>]{0,300}$/.test(u)) return '';
  try {
    var sh = sheet_(SHEET_SETTINGS, ['Setting', 'Value', 'Notes']);
    var rows = sh.getRange(2, 1, Math.max(sh.getLastRow() - 1, 1), 1).getValues();
    for (var i = 0; i < rows.length; i++) if (String(rows[i][0]).trim() === 'App Link') { sh.getRange(i + 2, 2, 1, 1).setValues([[u]]); break; }
    clearSettingsCache_();
  } catch (e) { /* ignore */ }
  return u;
}

function recordLink_(base, id) {
  if (!base || !id) return '';
  return base + (base.indexOf('?') >= 0 ? '&' : '?') + 'id=' + encodeURIComponent(id);
}

/* ---------------------------------------------------------------- helpers */
function ss_() {
  return SPREADSHEET_ID ? SpreadsheetApp.openById(SPREADSHEET_ID) : SpreadsheetApp.getActiveSpreadsheet();
}

function styleHeader_(range) {
  range.setFontWeight('bold').setBackground('#16325C').setFontColor('#FFFFFF');
}

function sheet_(name, headers) {
  var ss = ss_();
  var sh = ss.getSheetByName(name);
  if (!sh) sh = ss.insertSheet(name);
  if (headers && sh.getLastRow() === 0) {
    styleHeader_(sh.getRange(1, 1, 1, headers.length).setValues([headers]));
    sh.setFrozenRows(1);
  }
  return sh;
}

// Returns the records sheet; if its columns are from an older version, rewrites every row
// into the current layout (using each row's JSON) so nothing is lost or misaligned.
function recordsSheet_() {
  var sh = sheet_(SHEET_RECORDS, HEADERS);
  var width = Math.max(sh.getLastColumn(), 1);
  var head = sh.getRange(1, 1, 1, width).getValues()[0].map(String);
  while (head.length && head[head.length - 1] === '') head.pop();
  if (head.join('|') === HEADERS.join('|')) return sh;

  var map = {}; head.forEach(function (h, i) { if (h) map[h] = i; });
  var last = sh.getLastRow();
  var rows = last > 1 ? sh.getRange(2, 1, last - 1, width).getValues() : [];
  var recs = rows.map(function (r) { return fromRow_(r, map); }).filter(function (r) { return r && r.id; });
  sh.getRange(1, 1, Math.max(last, 1), Math.max(width, HEADERS.length)).clearContent();
  styleHeader_(sh.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]));
  sh.setFrozenRows(1);
  if (recs.length) {
    var base = appSettings_().appLink;
    var rg = sh.getRange(2, 1, recs.length, HEADERS.length);
    rg.setNumberFormat('@');
    rg.setValues(recs.map(function (r) { return toRow_(r, base); }));
  }
  return sh;
}

function tz_() {
  try { return Session.getScriptTimeZone() || 'Asia/Kolkata'; } catch (e) { return 'Asia/Kolkata'; }
}

function fmtDate_(iso) {
  var d = iso ? new Date(iso) : new Date();
  if (isNaN(d.getTime())) d = new Date();
  return Utilities.formatDate(d, tz_(), 'yyyy-MM-dd HH:mm');
}

function cell_(v) {
  if (v === null || v === undefined) return '';
  var s = String(v);
  if (s.length > 49000) s = s.slice(0, 49000);
  return /^[=]/.test(s) ? "'" + s : s; // stop formula injection
}

function g_(o, path) {
  return path.split('.').reduce(function (a, k) { return a && a[k] !== undefined && a[k] !== null ? a[k] : ''; }, o);
}

function validId_(id) {
  return /^[A-Za-z0-9_.-]{4,48}$/.test(String(id || ''));
}

function findRow_(sh, id) {
  var last = sh.getLastRow();
  if (last < 2) return -1;
  var ids = sh.getRange(2, 1, last - 1, 1).getValues();
  for (var i = 0; i < ids.length; i++) if (String(ids[i][0]) === String(id)) return i + 2;
  return -1;
}

function clean_(r) {
  var c = JSON.parse(JSON.stringify(r || {}));
  delete c.price; delete c._pending; delete c._manual;
  return c;
}

function toRow_(rec, base) {
  var r = clean_(rec), f = r.fan || {}, a = r.acc || {};
  var duct = a.ductShape === 'Round' ? (a.ductDia ? 'Ø' + a.ductDia : '') : (a.ductW && a.ductH ? a.ductW + ' x ' + a.ductH : '');
  var map = {
    'ID': r.id,
    'Created': fmtDate_(r.createdAt),
    'Updated': fmtDate_(r.updatedAt),
    'Application': r.application,
    'Customer Name': g_(r, 'customer.name'),
    'Customer Phone': g_(r, 'customer.phone'),
    'Customer Email': g_(r, 'customer.email'),
    'Customer Address': g_(r, 'customer.address'),
    'Site Address': g_(r, 'site.address'),
    'Site Electrician': g_(r, 'site.electrician'),
    'Site Engineer': g_(r, 'site.engineer'),
    'Megaverks Engineer': r.ourEngineer,
    'Blower Model': f.modelLabel,
    'Motor HP': f.hp,
    'RPM': f.rpm,
    'Casing Size': f.casing,
    'Inlet Dia mm': f.inletDia,
    'Blower Outlet mm': f.outletW && f.outletD ? f.outletW + ' x ' + f.outletD : '',
    'Duct Outlet mm': duct,
    'Airflow CFM': f.cfm,
    'Static Pressure mmWC': f.sp,
    'Discharge Form': f.form,
    'Drive Arrangement': f.arrangement,
    'Material': f.material,
    'Damper': a.damper,
    'Canvas': a.canvas,
    'Filters': r.application === 'Fresh Air' && a.filters ? a.filters + ' x ' + (a.filterType || '') : '',
    'Qty': f.qty,
    'Open Link': recordLink_(base, r.id),
    'PDF URL': r.pdfUrl,
    'JSON': JSON.stringify(r)
  };
  return HEADERS.map(function (h) { return cell_(map[h]); });
}

function fromRow_(row, map) {
  map = map || COL;
  var v = function (h) { return map[h] === undefined ? '' : row[map[h]]; };
  var json = v('JSON');
  if (json) {
    try {
      var r = JSON.parse(json);
      if (v('PDF URL') && !r.pdfUrl) r.pdfUrl = String(v('PDF URL'));
      return clean_(r);
    } catch (e) { /* fall through to flat columns */ }
  }
  if (!v('ID')) return null;
  // Row typed by hand in the sheet: rebuild what we can
  return {
    id: String(v('ID')), createdAt: String(v('Created')), updatedAt: String(v('Updated')),
    application: String(v('Application') || 'Exhaust'),
    customer: { name: String(v('Customer Name')), phone: String(v('Customer Phone')), email: String(v('Customer Email')), address: String(v('Customer Address')) },
    site: { address: String(v('Site Address')), electrician: String(v('Site Electrician')), engineer: String(v('Site Engineer')) },
    ourEngineer: String(v('Megaverks Engineer')),
    fan: { modelLabel: String(v('Blower Model')), hp: v('Motor HP'), rpm: v('RPM'), casing: v('Casing Size'), cfm: v('Airflow CFM'), sp: v('Static Pressure mmWC'),
      form: String(v('Discharge Form') || 'R3'), arrangement: String(v('Drive Arrangement') || 'Arr-A'), material: String(v('Material')), qty: v('Qty') || 1 },
    acc: { damper: String(v('Damper') || 'None'), canvas: String(v('Canvas') || 'None') },
    pdfUrl: String(v('PDF URL') || ''),
    _manual: true
  };
}

/* ---------------------------------------------------------------- actions */
function ping_(st) {
  var sh = recordsSheet_();
  return {
    ok: true, success: true, app: 'MEGAVERKS-BLOWER', version: VERSION, appLink: (st && st.appLink) || '', scriptUrl: (st && st.scriptUrl) || '',
    spreadsheet: ss_().getName(), sheet: SHEET_RECORDS,
    records: Math.max(sh.getLastRow() - 1, 0),
    time: new Date().toISOString(), timezone: tz_()
  };
}

function list_(limit) {
  var sh = recordsSheet_();
  var last = sh.getLastRow();
  if (last < 2) return { ok: true, records: [] };
  var rows = sh.getRange(2, 1, last - 1, HEADERS.length).getValues();
  var out = [];
  rows.forEach(function (row) { var r = fromRow_(row); if (r && r.id) out.push(r); });
  out.sort(function (a, b) { return String(b.updatedAt).localeCompare(String(a.updatedAt)); });
  var n = Math.min(parseInt(limit, 10) || MAX_LIST, MAX_LIST);
  return { ok: true, records: out.slice(0, n), total: out.length };
}

function get_(id) {
  if (!validId_(id)) return { ok: false, error: 'Invalid record ID' };
  var sh = recordsSheet_();
  var row = findRow_(sh, id);
  if (row < 0) return { ok: false, error: 'Record not found: ' + id, code: 'NOT_FOUND' };
  return { ok: true, record: fromRow_(sh.getRange(row, 1, 1, HEADERS.length).getValues()[0]) };
}

function save_(rec, pdfBase64, base) {
  if (typeof rec === 'string') { try { rec = JSON.parse(rec); } catch (e) { rec = null; } }
  if (!rec || typeof rec !== 'object') return { ok: false, error: 'Missing record' };
  rec = clean_(rec);
  if (!validId_(rec.id)) return { ok: false, error: 'Invalid record ID' };
  if (!g_(rec, 'customer.name')) return { ok: false, error: 'Customer name is required' };

  var lock = LockService.getScriptLock();
  lock.waitLock(25000);
  try {
    var sh = recordsSheet_();
    var rowNo = findRow_(sh, rec.id);
    var now = new Date().toISOString();
    if (rowNo > 0) {
      var old = fromRow_(sh.getRange(rowNo, 1, 1, HEADERS.length).getValues()[0]) || {};
      rec.createdAt = old.createdAt || rec.createdAt || now;
      if (!pdfBase64 && old.pdfUrl && !rec.pdfUrl) rec.pdfUrl = old.pdfUrl;
    } else {
      rec.createdAt = rec.createdAt || now;
    }
    rec.updatedAt = now;

    var pdfError = '';
    if (pdfBase64) {
      try { rec.pdfUrl = savePdf_(rec, pdfBase64); }
      catch (e) { pdfError = 'PDF not stored in Drive: ' + (e.message || e); }
    }

    if (rowNo < 0) rowNo = sh.getLastRow() + 1;
    var range = sh.getRange(rowNo, 1, 1, HEADERS.length);
    range.setNumberFormat('@');
    range.setValues([toRow_(rec, base)]);
    return { ok: true, id: rec.id, createdAt: rec.createdAt, updatedAt: rec.updatedAt, pdfUrl: rec.pdfUrl || '', row: rowNo, warning: pdfError };
  } finally {
    lock.releaseLock();
  }
}

function folder_() {
  var it = DriveApp.getFoldersByName(DRIVE_FOLDER);
  return it.hasNext() ? it.next() : DriveApp.createFolder(DRIVE_FOLDER);
}

function savePdf_(rec, b64) {
  var data = String(b64).replace(/^data:application\/pdf;[^,]*,/, '');
  var folder = folder_();
  // Remove the previous PDF of this record so the folder holds one file per ID
  var old = folder.searchFiles('title contains "' + rec.id + '"');
  while (old.hasNext()) { var f = old.next(); if (String(f.getName()).indexOf(rec.id) === 0) f.setTrashed(true); }
  var cust = String(g_(rec, 'customer.name') || 'Customer').replace(/[^A-Za-z0-9 _-]/g, '').trim().slice(0, 40);
  var blob = Utilities.newBlob(Utilities.base64Decode(data), 'application/pdf', rec.id + ' - ' + cust + '.pdf');
  var file = folder.createFile(blob);
  try { file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW); } catch (e) { /* domain policy may block link sharing */ }
  return file.getUrl();
}

function delete_(id) {
  if (!validId_(id)) return { ok: false, error: 'Invalid record ID' };
  var lock = LockService.getScriptLock();
  lock.waitLock(25000);
  try {
    var sh = recordsSheet_();
    var row = findRow_(sh, id);
    if (row < 0) return { ok: false, error: 'Record not found: ' + id };
    sh.deleteRow(row);
    try {
      var it = folder_().searchFiles('title contains "' + id + '"');
      while (it.hasNext()) { var f = it.next(); if (String(f.getName()).indexOf(id) === 0) f.setTrashed(true); }
    } catch (e) { /* ignore drive errors */ }
    return { ok: true, id: id };
  } finally {
    lock.releaseLock();
  }
}

/* ------------------------------------------------- blower & casing master */
function readMaster_() {
  var bs = sheet_(SHEET_BLOWERS, BLOWER_HEADERS);
  if (bs.getLastRow() < 2) bs.getRange(2, 1, DEFAULT_BLOWERS.length, BLOWER_HEADERS.length).setValues(DEFAULT_BLOWERS);
  var cs = sheet_(SHEET_CASINGS, CASING_HEADERS);
  if (cs.getLastRow() < 2) cs.getRange(2, 1, DEFAULT_CASINGS.length, CASING_HEADERS.length).setValues(DEFAULT_CASINGS);

  var blowers = bs.getRange(2, 1, bs.getLastRow() - 1, BLOWER_HEADERS.length).getValues()
    .filter(function (r) { return r[0] !== '' && r[1] !== ''; })
    .map(function (r) {
      return { id: String(r[0]), label: String(r[1]), hp: Number(r[2]) || 0, rpm: Number(r[3]) || 0, casing: Number(r[4]) || 0,
        active: !(r[5] === false || String(r[5]).toUpperCase() === 'FALSE') };
    });
  var casings = cs.getRange(2, 1, cs.getLastRow() - 1, CASING_HEADERS.length).getValues()
    .filter(function (r) { return Number(r[0]) > 0; })
    .map(function (r) {
      var f = casingFormula_(r[0]);
      return { casing: Number(r[0]), inlet: Number(r[1]) || f[1], outW: Number(r[2]) || f[2], outD: Number(r[3]) || f[3],
        ductW: Number(r[4]) || f[4], ductH: Number(r[5]) || f[5] };
    })
    .sort(function (a, b) { return a.casing - b.casing; });
  return { blowers: blowers, casings: casings };
}

function saveMaster_(m) {
  if (typeof m === 'string') { try { m = JSON.parse(m); } catch (e) { m = null; } }
  if (!m || !Array.isArray(m.blowers) || !Array.isArray(m.casings)) return { ok: false, error: 'Master data missing' };
  if (!m.blowers.length) return { ok: false, error: 'Add at least one blower' };
  if (!m.casings.length) return { ok: false, error: 'Add at least one casing size' };
  var seen = {}, ids = {};
  var casRows = m.casings.map(function (c, i) {
    var n = Number(c.casing);
    if (!(n > 0)) throw new Error('Casing row ' + (i + 1) + ': casing size must be a number');
    if (seen[n]) throw new Error('Casing ' + n + ' is listed twice');
    seen[n] = true;
    var f = casingFormula_(n);
    return [n, Number(c.inlet) || f[1], Number(c.outW) || f[2], Number(c.outD) || f[3], Number(c.ductW) || f[4], Number(c.ductH) || f[5]];
  }).sort(function (a, b) { return a[0] - b[0]; });
  var blRows = m.blowers.map(function (b, i) {
    if (!b.label) throw new Error('Blower row ' + (i + 1) + ': label is required');
    if (!(Number(b.hp) > 0)) throw new Error('Blower row ' + (i + 1) + ': HP is required');
    if (!(Number(b.rpm) > 0)) throw new Error('Blower row ' + (i + 1) + ': RPM is required');
    var id = String(b.id || (b.hp + 'HP-' + b.rpm));
    if (ids[id]) id = id + '-' + (i + 1);
    ids[id] = true;
    return [id, String(b.label), Number(b.hp), Number(b.rpm), Number(b.casing) || '', b.active !== false];
  });
  var lock = LockService.getScriptLock();
  lock.waitLock(25000);
  try {
    [[SHEET_BLOWERS, BLOWER_HEADERS, blRows], [SHEET_CASINGS, CASING_HEADERS, casRows]].forEach(function (t) {
      var sh = sheet_(t[0], t[1]);
      var last = sh.getLastRow();
      if (last > 1) sh.getRange(2, 1, last - 1, t[1].length).clearContent();
      sh.getRange(2, 1, t[2].length, t[1].length).setValues(t[2]);
    });
  } finally {
    lock.releaseLock();
  }
  return { ok: true, master: readMaster_() };
}

function selftest_(checkDrive) {
  var sh = sheet_(SHEET_HEALTH, ['Time', 'Check']);
  var stamp = 'wt-' + Date.now() + '-' + Math.floor(Math.random() * 1e6);
  sh.appendRow([new Date(), stamp]);
  var last = sh.getLastRow();
  var readBack = String(sh.getRange(last, 2, 1, 1).getValues()[0][0]);
  if (last > 60) sh.deleteRows(2, last - 60);
  var res = { ok: true, write: readBack === stamp, time: new Date().toISOString() };
  if (String(checkDrive) === 'true' || checkDrive === true) {
    try { res.drive = true; res.driveFolder = folder_().getName(); }
    catch (e) { res.drive = false; res.driveError = String(e.message || e); }
  }
  return res;
}


/* ============================================================================
 * BLOWER / FAN / AHU + TESTING + WARRANTY SYSTEM
 * (from apps-script-backend.js — same logic; passcode is checked in route_ above)
 * ========================================================================== */
const SHEETS = {
  CUSTOMERS: "Customers",
  TESTING: "Testing",
  WARRANTY: "Warranty",
  SISW: "SISW_Selections",
  AXIAL: "Axial_Selections",
  LLD: "LLD_Selections",
  AHU: "AHU"
};

// Text typed in the app must never run as a spreadsheet formula
function safeRow_(arr) {
  return arr.map(function (v) { return (typeof v === 'string' && /^[=]/.test(v)) ? "'" + v : (v === undefined || v === null ? '' : v); });
}
function appendSafe_(sheet, arr) { sheet.appendRow(safeRow_(arr)); }

// ---- CUSTOMERS ----
function getCustomers(ss) {
  const sheet = getOrCreateSheet(ss, SHEETS.CUSTOMERS,
    ["CustomerName","EngineerName","SiteName","CustomerContact","ProjectName","SiteContactPerson","SiteAddress","Timestamp"]);
  const data = sheet.getDataRange().getValues();
  const customers = [];
  for (let i = 1; i < data.length; i++) {
    customers.push({
      customerName: data[i][0], engineerName: data[i][1], siteName: data[i][2],
      customerContact: data[i][3], projectName: data[i][4],
      siteContactPerson: data[i][5], siteAddress: data[i][6], timestamp: data[i][7]
    });
  }
  return { success: true, customers };
}

function saveCustomer(ss, data) {
  const sheet = getOrCreateSheet(ss, SHEETS.CUSTOMERS,
    ["CustomerName","EngineerName","SiteName","CustomerContact","ProjectName","SiteContactPerson","SiteAddress","Timestamp"]);
  const values = sheet.getDataRange().getValues();
  let found = false;
  for (let i = 1; i < values.length; i++) {
    if (values[i][0] === data.customerName) {
      sheet.getRange(i+1, 1, 1, 8).setValues([safeRow_([data.customerName, data.engineerName, data.siteName, data.customerContact, data.projectName, data.siteContactPerson, data.siteAddress, new Date()])]);
      found = true; break;
    }
  }
  if (!found) appendSafe_(sheet, [data.customerName, data.engineerName, data.siteName, data.customerContact, data.projectName, data.siteContactPerson, data.siteAddress, new Date()]);
  return { success: true };
}

function getCustomerData(ss, name) {
  const sheet = getOrCreateSheet(ss, SHEETS.CUSTOMERS,
    ["CustomerName","EngineerName","SiteName","CustomerContact","ProjectName","SiteContactPerson","SiteAddress","Timestamp"]);
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === name) {
      return { success: true, customer: {
        customerName: data[i][0], engineerName: data[i][1], siteName: data[i][2],
        customerContact: data[i][3], projectName: data[i][4],
        siteContactPerson: data[i][5], siteAddress: data[i][6]
      }};
    }
  }
  return { success: true, customer: null };
}

// ---- TESTING ----
function getTesting(ss, customer) {
  const sheet = getOrCreateSheet(ss, SHEETS.TESTING,
    ["Timestamp","CustomerName","EngineerName","SiteLocation","SiteContact","Rotation","DriveType","Pulley","VBelts",
     "StaticPressure","Vel1","Vel2","Vel3","Vel4","VelAvg","CFM","MotorHP","MotorRPM","Phase","Vibration",
     "NoiseDB","Amps","Voltage","Remarks"]);
  const data = sheet.getDataRange().getValues();
  const records = [];
  for (let i = 1; i < data.length; i++) {
    if (!customer || data[i][1] === customer) {
      records.push({
        timestamp: data[i][0], customerName: data[i][1], engineerName: data[i][2], siteLocation: data[i][3],
        siteContact: data[i][4], rotation: data[i][5], driveType: data[i][6], pulley: data[i][7], vBelts: data[i][8],
        staticPressure: data[i][9], vel1: data[i][10], vel2: data[i][11], vel3: data[i][12], vel4: data[i][13],
        velAvg: data[i][14], cfm: data[i][15], motorHP: data[i][16], motorRPM: data[i][17], phase: data[i][18],
        vibration: data[i][19], noiseDB: data[i][20], amps: data[i][21], voltage: data[i][22], remarks: data[i][23]
      });
    }
  }
  return { success: true, records };
}

function getAllTesting(ss) { return getTesting(ss, ""); }

function saveTesting(ss, data) {
  const sheet = getOrCreateSheet(ss, SHEETS.TESTING,
    ["Timestamp","CustomerName","EngineerName","SiteLocation","SiteContact","Rotation","DriveType","Pulley","VBelts",
     "StaticPressure","Vel1","Vel2","Vel3","Vel4","VelAvg","CFM","MotorHP","MotorRPM","Phase","Vibration",
     "NoiseDB","Amps","Voltage","Remarks"]);
  appendSafe_(sheet, [
    new Date(), data.customerName, data.engineerName, data.siteLocation, data.siteContact,
    data.rotation, data.driveType, data.pulley, data.vBelts, data.staticPressure,
    data.vel1, data.vel2, data.vel3, data.vel4, data.velAvg, data.cfm,
    data.motorHP, data.motorRPM, data.phase, data.vibration, data.noiseDB,
    data.amps, data.voltage, data.remarks
  ]);
  return { success: true };
}

// ---- WARRANTY ----
function getAllWarranty(ss) {
  const sheet = getOrCreateSheet(ss, SHEETS.WARRANTY,
    ["Timestamp","CustomerName","ProductType","ProductModel","SerialNumber","SupplyDate","PeriodMonths","ExpiryDate","Status","EngineerName","SiteLocation","Remarks"]);
  const data = sheet.getDataRange().getValues();
  const records = [];
  for (let i = 1; i < data.length; i++) {
    records.push({
      timestamp: data[i][0], customerName: data[i][1], productType: data[i][2], productModel: data[i][3],
      serialNumber: data[i][4], supplyDate: data[i][5], periodMonths: data[i][6], expiryDate: data[i][7],
      status: data[i][8], engineerName: data[i][9], siteLocation: data[i][10], remarks: data[i][11]
    });
  }
  return { success: true, records };
}

function saveWarranty(ss, data) {
  const sheet = getOrCreateSheet(ss, SHEETS.WARRANTY,
    ["Timestamp","CustomerName","ProductType","ProductModel","SerialNumber","SupplyDate","PeriodMonths","ExpiryDate","Status","EngineerName","SiteLocation","Remarks"]);
  appendSafe_(sheet, [
    new Date(), data.customerName, data.productType, data.productModel, data.serialNumber,
    data.supplyDate, data.periodMonths, data.expiryDate, data.status,
    data.engineerName, data.siteLocation, data.remarks
  ]);
  return { success: true };
}

// ---- SELECTIONS ----
function saveSelection(ss, data) {
  const type = data.type;
  const sheetName = type === "SISW" ? SHEETS.SISW : type === "Axial" ? SHEETS.AXIAL : SHEETS.LLD;
  const sheet = getOrCreateSheet(ss, sheetName, ["Timestamp","CustomerName","SelectionData"]);
  appendSafe_(sheet, [new Date(), data.customerName, JSON.stringify(data.selection)]);
  return { success: true };
}

function getSelections(ss, customer) {
  const result = {};
  [SHEETS.SISW, SHEETS.AXIAL, SHEETS.LLD].forEach(name => {
    const sheet = getOrCreateSheet(ss, name, ["Timestamp","CustomerName","SelectionData"]);
    const data = sheet.getDataRange().getValues();
    for (let i = data.length - 1; i >= 1; i--) {
      if (data[i][1] === customer) {
        try { result[name] = JSON.parse(data[i][2]); } catch(e) { result[name] = data[i][2]; }
        break;
      }
    }
  });
  return { success: true, selections: result };
}

// ---- AHU ----
function saveAHU(ss, data) {
  const sheet = getOrCreateSheet(ss, SHEETS.AHU,
    ["Timestamp","CustomerName","CFM","SP","FanModel","MotorHP","MotorRPM","UnitType"]);
  appendSafe_(sheet, [
    new Date(), data.customerName, data.cfm, data.sp, data.fanModel,
    data.motorHp, data.motorRpm, data.unitType
  ]);
  return { success: true };
}

// ---- UTILS ----
function getOrCreateSheet(ss, name, headers) {
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#1a237e").setFontColor("white");
  }
  return sheet;
}

/* ------------------------------------------------- run once from the editor */
function setup() {
  clearSettingsCache_();
  var st = appSettings_();
  recordsSheet_();
  readMaster_();
  sheet_(SHEET_HEALTH, ['Time', 'Check']);
  getCustomers(ss_()); getAllTesting(ss_()); getAllWarranty(ss_()); getSelections(ss_(), '');
  getOrCreateSheet(ss_(), SHEETS.AHU, ["Timestamp","CustomerName","CFM","SP","FanModel","MotorHP","MotorRPM","UnitType"]);
  folder_();
  Logger.log('Setup complete. Passcode: ' + st.pass + '   Admin PIN: ' + st.pin + '  (see the App Settings tab)');
  Logger.log('Next: Deploy → New deployment → Web app (Execute as: Me, Who has access: Anyone).');
}
