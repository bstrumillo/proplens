/**
 * PropLens Email Ingestion — Google Apps Script
 *
 * SETUP:
 * 1. Go to https://script.google.com (sign in as groupbms4@gmail.com)
 * 2. Create a new project: "PropLens Email Ingestion"
 * 3. Paste this entire script
 * 4. Go to Project Settings (gear icon) → Script Properties
 *    - Add: CRON_SECRET = (same value as in Railway env vars)
 *    - Add: PROPLENS_URL = https://proplens-production.up.railway.app/api/v1/ingest/email
 * 5. Run processAppFolioEmails() once manually (click play button)
 *    - Grant Gmail permissions when prompted
 * 6. Go to Triggers (clock icon on left sidebar) → Add Trigger:
 *    - Function: processAppFolioEmails
 *    - Event source: Time-driven
 *    - Type: Minutes timer
 *    - Interval: Every 15 minutes
 *
 * CUSTOMIZATION:
 * - Change SEARCH_QUERY below to match your AppFolio sender address
 * - Check one of your AppFolio emails to see the exact "From" address
 */

const SEARCH_QUERY = "has:attachment filename:csv is:unread";
// If you know the AppFolio sender, use: "from:noreply@appfolio.com has:attachment filename:csv is:unread"

function processAppFolioEmails() {
  const props = PropertiesService.getScriptProperties();
  const cronSecret = props.getProperty("CRON_SECRET");
  const proplensUrl = props.getProperty("PROPLENS_URL");

  if (!cronSecret || !proplensUrl) {
    console.error("Missing script properties. Set CRON_SECRET and PROPLENS_URL in Project Settings → Script Properties.");
    return;
  }

  const threads = GmailApp.search(SEARCH_QUERY, 0, 10);
  const label = getOrCreateLabel("PropLens/Imported");

  console.log(`Found ${threads.length} threads matching query`);

  for (const thread of threads) {
    for (const message of thread.getMessages()) {
      if (!message.isUnread()) continue;

      const attachments = message.getAttachments();
      let processed = false;

      for (const attachment of attachments) {
        const name = attachment.getName().toLowerCase();
        if (!name.endsWith(".csv")) continue;

        console.log(`Processing: "${message.getSubject()}" — attachment: ${attachment.getName()}`);

        try {
          const result = sendToProplens(proplensUrl, cronSecret, message, attachment);
          console.log(`Result: ${JSON.stringify(result)}`);

          if (result.status === "imported" || result.status === "already_processed" || result.status === "skipped") {
            processed = true;
          }
        } catch (error) {
          console.error(`Error processing ${attachment.getName()}: ${error}`);
        }
      }

      if (processed) {
        message.markRead();
        thread.addLabel(label);
      }
    }
  }
}

function sendToProplens(url, secret, message, attachment) {
  const boundary = "----ProplensBoundary" + Utilities.getUuid();

  const metadata = {
    gmailMessageId: message.getId(),
    subject: message.getSubject(),
    sender: message.getFrom(),
    receivedAt: message.getDate().toISOString(),
  };

  // Build multipart/form-data payload
  let payload = "";

  // Add text fields
  for (const [key, value] of Object.entries(metadata)) {
    payload += `--${boundary}\r\n`;
    payload += `Content-Disposition: form-data; name="${key}"\r\n\r\n`;
    payload += `${value}\r\n`;
  }

  // Add file field
  payload += `--${boundary}\r\n`;
  payload += `Content-Disposition: form-data; name="file"; filename="${attachment.getName()}"\r\n`;
  payload += `Content-Type: text/csv\r\n\r\n`;

  // Convert to blob for binary-safe handling
  const preFileBlob = Utilities.newBlob(payload).getBytes();
  const fileBytes = attachment.copyBlob().getBytes();
  const postFile = Utilities.newBlob(`\r\n--${boundary}--\r\n`).getBytes();

  // Concatenate all parts
  const fullPayload = [...preFileBlob, ...fileBytes, ...postFile];

  const options = {
    method: "post",
    contentType: `multipart/form-data; boundary=${boundary}`,
    payload: Utilities.newBlob(fullPayload).getBytes(),
    headers: {
      Authorization: `Bearer ${secret}`,
    },
    muteHttpExceptions: true,
  };

  const response = UrlFetchApp.fetch(url, options);
  const statusCode = response.getResponseCode();

  if (statusCode !== 200) {
    throw new Error(`HTTP ${statusCode}: ${response.getContentText()}`);
  }

  return JSON.parse(response.getContentText());
}

function getOrCreateLabel(name) {
  let label = GmailApp.getUserLabelByName(name);
  if (!label) {
    label = GmailApp.createLabel(name);
  }
  return label;
}

/**
 * Test function — run manually to verify the connection works.
 * Creates a test CSV and sends it to the PropLens endpoint.
 */
function testConnection() {
  const props = PropertiesService.getScriptProperties();
  const cronSecret = props.getProperty("CRON_SECRET");
  const proplensUrl = props.getProperty("PROPLENS_URL");

  if (!cronSecret || !proplensUrl) {
    console.error("Missing script properties.");
    return;
  }

  const testCsv = "Unit,Tenant,Monthly Rent,Status\n636-A,Test Tenant,1200,Occupied";
  const blob = Utilities.newBlob(testCsv, "text/csv", "test-report.csv");

  const boundary = "----TestBoundary" + Utilities.getUuid();
  let payload = "";
  payload += `--${boundary}\r\nContent-Disposition: form-data; name="gmailMessageId"\r\n\r\ntest-${Date.now()}\r\n`;
  payload += `--${boundary}\r\nContent-Disposition: form-data; name="subject"\r\n\r\nTest Import\r\n`;
  payload += `--${boundary}\r\nContent-Disposition: form-data; name="sender"\r\n\r\ntest@test.com\r\n`;
  payload += `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="test-report.csv"\r\nContent-Type: text/csv\r\n\r\n`;

  const pre = Utilities.newBlob(payload).getBytes();
  const file = blob.getBytes();
  const post = Utilities.newBlob(`\r\n--${boundary}--\r\n`).getBytes();

  const response = UrlFetchApp.fetch(proplensUrl, {
    method: "post",
    contentType: `multipart/form-data; boundary=${boundary}`,
    payload: Utilities.newBlob([...pre, ...file, ...post]).getBytes(),
    headers: { Authorization: `Bearer ${cronSecret}` },
    muteHttpExceptions: true,
  });

  console.log(`Status: ${response.getResponseCode()}`);
  console.log(`Response: ${response.getContentText()}`);
}
