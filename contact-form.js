/**
 * Purpose: Contact form backend. Verifies Cloudflare Turnstile, then emails the message.
 * Input: POST FormData (name, email, phone, service, message, cf-turnstile-response)
 * Output: JSON { success: true|false }
 *
 * Script Properties:
 *   TURNSTILE_SECRET — widget secret (from local .env SECRET)
 *   TURNSTILE_HOSTNAMES — optional comma list; default yaeldruckman.com,www.yaeldruckman.com
 *
 * Deploy: Apps Script web app, Execute as Me, Who has access: Anyone.
 * Paste the /exec URL into script.js as scriptURL.
 */
const TURNSTILE_ACTION = "contact";
const DEFAULT_HOSTNAMES = "yaeldruckman.com,www.yaeldruckman.com";

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON,
  );
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

function doPost(e) {
  const data = getPayload_(e);
  const token = data["cf-turnstile-response"] || "";

  if (!verifyTurnstile_(token)) {
    return json_({ success: false });
  }

  GmailApp.sendEmail(
    "you@gmail.com",
    `Contact form: ${data.subject || "New message"}`,
    data.message,
    {
      replyTo: data.email,
      name: data.name || "Website visitor",
    },
  );

  return json_({ success: true });
}
