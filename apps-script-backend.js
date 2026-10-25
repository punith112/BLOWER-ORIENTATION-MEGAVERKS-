// ============================================================
// GOOGLE APPS SCRIPT - MEGAVERKS BLOWER / FAN / AHU / TESTING / WARRANTY BACKEND
// Deploy as Web App (Execute as: Me, Access: Anyone)
// ============================================================

const SHEETS = {
  CUSTOMERS: "Customers",
  TESTING: "Testing",
  WARRANTY: "Warranty",
  SISW: "SISW_Selections",
  AXIAL: "Axial_Selections",
  LLD: "LLD_Selections",
  AHU: "AHU"
};

function doGet(e) {
  const action = e.parameter.action;
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (action === "getCustomers") return jsonResponse(getCustomers(ss));
  if (action === "getTesting") return jsonResponse(getTesting(ss, e.parameter.customer || ""));
  if (action === "getAllTesting") return jsonResponse(getAllTesting(ss));
  if (action === "getCustomerData") return jsonResponse(getCustomerData(ss, e.parameter.name || ""));
  if (action === "getSelections") return jsonResponse(getSelections(ss, e.parameter.customer || ""));
  if (action === "getAllWarranty") return jsonResponse(getAllWarranty(ss));
  return jsonResponse({ error: "Unknown action" });
}

function doPost(e) {
  const data = JSON.parse(e.postData.contents);
  const action = data.action;
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (action === "saveCustomer") return jsonResponse(saveCustomer(ss, data));
  if (action === "saveTesting") return jsonResponse(saveTesting(ss, data));
  if (action === "saveWarranty") return jsonResponse(saveWarranty(ss, data));
  if (action === "saveSelection") return jsonResponse(saveSelection(ss, data));
  if (action === "saveAHU") return jsonResponse(saveAHU(ss, data));
  return jsonResponse({ error: "Unknown action" });
}

function jsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

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
      sheet.getRange(i+1, 1, 1, 8).setValues([[data.customerName, data.engineerName, data.siteName, data.customerContact, data.projectName, data.siteContactPerson, data.siteAddress, new Date()]]);
      found = true; break;
    }
  }
  if (!found) sheet.appendRow([data.customerName, data.engineerName, data.siteName, data.customerContact, data.projectName, data.siteContactPerson, data.siteAddress, new Date()]);
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
  sheet.appendRow([
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
  sheet.appendRow([
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
  sheet.appendRow([new Date(), data.customerName, JSON.stringify(data.selection)]);
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
  sheet.appendRow([
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
