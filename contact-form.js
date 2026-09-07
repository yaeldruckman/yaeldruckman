/**
 * Purpose: Contact form backend. Verifies Cloudflare Turnstile, then emails the message.
 * Input: POST FormData (name, email, phone, service, message, cf-turnstile-response)
 * Output: JSON { success: true|false }
 *
 * Script Properties:
 *   TURNSTILE_SECRET — widget secret (from local .env SECRET)
 *   TURNSTILE_HOSTNAMES — optional comma list; default includes apex, www, and the Vercel preview host
 *
 * Deploy: Apps Script web app, Execute as Me, Who has access: Anyone.
 * Paste the /exec URL into script.js as scriptURL.
 *
 * Gmail: create this project while logged in as yaeldruckman@gmail.com
 * (office@yaeldruckman.com is a Send-as alias on that same mailbox).
 * The "website" label is applied there.
 */
const TURNSTILE_ACTION = "contact";
const DEFAULT_HOSTNAMES =
  "yaeldruckman.com,www.yaeldruckman.com,yael-druckman-website-7p9k.vercel.app";
const RECIPIENT = "office@yaeldruckman.com";
const GMAIL_LABEL = "website";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON,
  );
}

function str_(value, max) {
  return String(value == null ? "" : value)
    .replace(/[\r\n]+/g, " ")
    .trim()
    .slice(0, max);
}

function getPayload_(e) {
  if (!e) return {};
  const type = (e.postData && e.postData.type) || "";
  if (type.indexOf("application/json") !== -1 && e.postData.contents) {
    try {
      return JSON.parse(e.postData.contents) || {};
    } catch (err) {
      return {};
    }
  }
  return e.parameter || {};
}

function verifyTurnstile_(token) {
  if (typeof token !== "string" || token.length === 0 || token.length > 2048) {
    return false;
  }

  const props = PropertiesService.getScriptProperties();
  const secret = props.getProperty("TURNSTILE_SECRET");
  const hostnameCsv =
    props.getProperty("TURNSTILE_HOSTNAMES") || DEFAULT_HOSTNAMES;
  const expectedHostnames = {};
  String(hostnameCsv)
    .split(",")
    .forEach(function (part) {
      const name = part.trim().toLowerCase();
      if (name) expectedHostnames[name] = true;
    });

  if (!secret || Object.keys(expectedHostnames).length === 0) {
    return false;
  }

  let result;
  try {
    const res = UrlFetchApp.fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "post",
        payload: {
          secret: secret,
          response: token,
        },
        muteHttpExceptions: true,
      },
    );
    const code = res.getResponseCode();
    if (code < 200 || code >= 300) return false;
    result = JSON.parse(res.getContentText());
  } catch (err) {
    return false;
  }

  const hostname = String(result.hostname || "").toLowerCase();
  return !!(
    result.success === true &&
    result.action === TURNSTILE_ACTION &&
    expectedHostnames[hostname]
  );
}

function applyWebsiteLabel_(subject) {
  const label =
    GmailApp.getUserLabelByName(GMAIL_LABEL) ||
    GmailApp.createLabel(GMAIL_LABEL);
  const safeSubject = String(subject || "").replace(/"/g, "");
  Utilities.sleep(2000);
  const threads = GmailApp.search(
    'newer_than:1d subject:"' + safeSubject + '"',
    0,
    1,
  );
  if (threads.length) threads[0].addLabel(label);
}

function doPost(e) {
  const data = getPayload_(e);
  const token = data["cf-turnstile-response"] || "";

  if (!verifyTurnstile_(token)) {
    return json_({ success: false });
  }

  const name = str_(data.name, 120);
  const email = str_(data.email, 254);
  const phone = str_(data.phone, 40);
  const service = str_(data.service, 80);
  const message = String(data.message == null ? "" : data.message)
    .trim()
    .slice(0, 5000);

  const subject = "Website contact: " + (service || "New message");
  const body = [
    "Name: " + name,
    "Email: " + email,
    "Phone: " + phone,
    "Interest: " + service,
    "",
    message,
  ].join("\n");

  const options = { name: "Yael Druckman website" };
  if (EMAIL_RE.test(email)) options.replyTo = email;
  const aliases = GmailApp.getAliases() || [];
  if (aliases.indexOf(RECIPIENT) !== -1) options.from = RECIPIENT;

  GmailApp.sendEmail(RECIPIENT, subject, body, options);

  try {
    applyWebsiteLabel_(subject);
  } catch (err) {
    // Email already sent; label is best-effort (Gmail index lag).
  }

  return json_({ success: true });
}
