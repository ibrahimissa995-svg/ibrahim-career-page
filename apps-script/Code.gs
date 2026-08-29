/**
 * Free shared backend for the QR career page: analytics + editable site content.
 * Deploy this as a Google Apps Script Web App (see root README.md for steps).
 * Analytics stores only anonymous event counters — no names, no IPs, no identifying data.
 * Content is the bilingual (EN/AR) page text, edited via admin.html.
 */

var SHEET_NAME = "Analytics";
var CONTENT_SHEET_NAME = "Content";
var HISTORY_SHEET_NAME = "ContentHistory";

// Seeded into the Content sheet the first time it's read, if empty.
// Keep this in sync with the DEFAULT_CONTENT constants in index.html / admin.html.
var DEFAULT_CONTENT = {
  greeting: {
    en_title: "Hello! I am currently looking for a new job opportunity 🚀",
    ar_title: "مرحباً بك! أنا أبحث حالياً عن فرصة عمل جديدة 🚀",
    en_subtitle: "Do you have an open role or vacancy in your company?",
    ar_subtitle: "هل لديك وظيفة أو شاغر متاح في شركتك/مؤسستك؟",
    en_yes: "Yes, we do",
    ar_yes: "نعم، لدينا شاغر",
    en_no: "No, not right now",
    ar_no: "لا، ليس لدينا الآن"
  },
  noScreen: {
    en_message: "Thank you for your time and interest! ❤️ If you know someone looking for talents like me, I'd really appreciate it if you could share this link with them.",
    ar_message: "شكراً لاهتمامك ووقتك! ❤️ إذا كنت تعرف أحداً يبحث عن كفاءات مثلي، أكون ممتناً جداً لو شاركت هذا الرابط معه."
  },
  profile: {
    name: "Ibrahim Abu Shameh",
    en_title: "Sales & Business Development Professional",
    ar_title: "",
    en_subtitle: "Customer Success · Sales Enablement · Sales Operations",
    ar_subtitle: "",
    en_badge: "Open to opportunities",
    ar_badge: "",
    en_about: "I am a Sales & Business Development Professional with a strong interest in driving growth, building lasting client relationships, and supporting sales operations. Coming from a Computer Information Systems (CIS) background with technical training (CCNA), I enjoy connecting technology with practical business needs — quickly adapting to new products, understanding client pain points, and communicating solutions effectively across industries.",
    ar_about: "أنا محترف مبيعات وتطوير أعمال، ولدي اهتمام كبير بتحقيق النمو وبناء علاقات طويلة الأمد مع العملاء ودعم عمليات المبيعات. أتمتع بخلفية في نظم المعلومات الحاسوبية (CIS) وتدريب تقني (CCNA)، وأستمتع بربط التكنولوجيا بالاحتياجات العملية للأعمال، من خلال التكيف السريع مع المنتجات الجديدة وفهم تحديات العملاء وتوصيل الحلول بفعالية عبر مختلف القطاعات."
  },
  focusAreas: [
    { icon: "🎯", en_title: "Sales & Biz Dev", ar_title: "المبيعات وتطوير الأعمال", en_desc: "Prospecting, client engagement & account support", ar_desc: "استقطاب العملاء المحتملين والتفاعل معهم ودعم الحسابات" },
    { icon: "🤝", en_title: "Customer Success", ar_title: "نجاح العملاء", en_desc: "Relationship management & onboarding", ar_desc: "إدارة العلاقات وتهيئة العملاء الجدد" },
    { icon: "⚙️", en_title: "Sales Enablement", ar_title: "تمكين المبيعات", en_desc: "Process optimization & CRM usage", ar_desc: "تحسين العمليات واستخدام أنظمة إدارة علاقات العملاء" },
    { icon: "💻", en_title: "Technical Aptitude", ar_title: "الكفاءة التقنية", en_desc: "CIS background, fast adaptation to tools", ar_desc: "خلفية في نظم المعلومات الحاسوبية وسرعة التكيف مع الأدوات" }
  ],
  skills: [
    { en: "Business Development", ar: "تطوير الأعمال" },
    { en: "Sales Operations", ar: "عمليات المبيعات" },
    { en: "Customer Success", ar: "نجاح العملاء" },
    { en: "Account Management", ar: "إدارة الحسابات" },
    { en: "Technical Product Sales", ar: "مبيعات المنتجات التقنية" },
    { en: "CRM Usage", ar: "استخدام أنظمة CRM" },
    { en: "Client Engagement", ar: "التفاعل مع العملاء" }
  ],
  education: {
    en_text: "Bachelor's Degree, Computer Information Systems — [Add university & year]",
    ar_text: "بكالوريوس في نظم المعلومات الحاسوبية — [أضف اسم الجامعة والسنة]"
  },
  roleOptions: [
    { value: "marketing", icon: "📈", en_title: "Marketing", ar_title: "التسويق", en_desc: "Brand, campaigns & growth-focused roles", ar_desc: "العلامة التجارية والحملات والأدوار التي تركز على النمو" },
    { value: "sales", icon: "🤝", en_title: "Sales Support / Sales Enablement", ar_title: "دعم المبيعات / تمكين المبيعات", en_desc: "CRM, process & sales operations roles", ar_desc: "أدوار إدارة علاقات العملاء والعمليات وعمليات المبيعات" },
    { value: "events", icon: "🎉", en_title: "Events Management", ar_title: "إدارة الفعاليات", en_desc: "Planning, coordination & on-site roles", ar_desc: "التخطيط والتنسيق والأدوار الميدانية" }
  ]
};

function doGet(e) {
  var action = e.parameter.action;
  if (action === "stats") {
    return respond(getStats());
  }
  if (action === "content") {
    return respond(getContent());
  }
  return respond({ error: "unknown action" });
}

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);

    if (data.action === "updateContent") {
      return respond(updateContent(data));
    }

    var event = data.event;
    var allowed = ["visits", "yes", "no", "resume_marketing", "resume_sales", "resume_events"];
    if (allowed.indexOf(event) === -1) {
      return respond({ ok: false, error: "invalid event" });
    }
    incrementCounter(event);
    return respond({ ok: true });
  } catch (err) {
    return respond({ ok: false, error: String(err) });
  }
}

// ---------- analytics ----------

function getSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(["event", "count"]);
  }
  return sheet;
}

function incrementCounter(event) {
  var sheet = getSheet();
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === event) {
      sheet.getRange(i + 1, 2).setValue(data[i][1] + 1);
      return;
    }
  }
  sheet.appendRow([event, 1]);
}

function getStats() {
  var sheet = getSheet();
  var data = sheet.getDataRange().getValues();
  var stats = {};
  for (var i = 1; i < data.length; i++) {
    stats[data[i][0]] = data[i][1];
  }
  return stats;
}

// ---------- content (admin-editable) ----------

function getContentSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(CONTENT_SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(CONTENT_SHEET_NAME);
    sheet.getRange("A1").setValue(JSON.stringify(DEFAULT_CONTENT));
    sheet.getRange("A2").setValue(new Date());
    sheet.getRange("C1").setValue("⚠️ Edit content only via admin.html — this cell holds raw JSON, don't hand-edit it.");
  }
  return sheet;
}

function getHistorySheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(HISTORY_SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(HISTORY_SHEET_NAME);
    sheet.appendRow(["timestamp", "previous_content_json"]);
  }
  return sheet;
}

function getContent() {
  var sheet = getContentSheet();
  var raw = sheet.getRange("A1").getValue();
  if (!raw) {
    raw = JSON.stringify(DEFAULT_CONTENT);
    sheet.getRange("A1").setValue(raw);
    sheet.getRange("A2").setValue(new Date());
  }
  try {
    return JSON.parse(raw);
  } catch (e) {
    return DEFAULT_CONTENT;
  }
}

function updateContent(data) {
  var secret = PropertiesService.getScriptProperties().getProperty("ADMIN_SECRET");
  if (!secret) {
    return { ok: false, error: "Server has no ADMIN_SECRET configured yet — set it in Project Settings > Script Properties." };
  }
  if (data.secret !== secret) {
    return { ok: false, error: "unauthorized" };
  }
  if (!data.content) {
    return { ok: false, error: "missing content" };
  }

  var sheet = getContentSheet();
  var prev = sheet.getRange("A1").getValue();
  if (prev) {
    getHistorySheet().appendRow([new Date(), prev]);
  }

  sheet.getRange("A1").setValue(JSON.stringify(data.content));
  sheet.getRange("A2").setValue(new Date());
  return { ok: true };
}

function respond(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
