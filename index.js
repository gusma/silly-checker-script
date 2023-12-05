const axios = require('axios');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const fs = require('fs');
const path = require('path');
const https = require('https');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, './.env') });

const urls = [
  process.env.URL_1,
  process.env.URL_2,
  process.env.URL_3
];

process.env.HTTP_PROXY = '';
process.env.HTTPS_PROXY = '';

function logToFile(message) {
  const logFilePath = path.resolve(__dirname, './logfile.log');
  fs.appendFileSync(logFilePath, `${new Date().toISOString()}: ${message}\n`);
}

async function sendTeamsNotification(message) {
  try {
    await axios.post(
      process.env.TEAMS_WEBHOOK_URL,
      { text: message },
      {
        httpsAgent: new https.Agent({ keepAlive: true }),
      }
    );
  } catch (error) {
    const errorSendingMessage = `Error sending Teams notification: ${error.message}`;
    logToFile(errorSendingMessage);
  }
}

async function checkAndSubmit(url) {
  if (!url) {
    logToFile('URLs to check on are undefined.');
    return;
  }

  try {
    await axios.head(url);
    const successMessage = `${url} is functioning.`;
    logToFile(successMessage);
    await submitForm(url);
  } catch (error) {
    const errorMessage = `${url} is not functioning. Error: ${error.message}`;
    logToFile(errorMessage);
    await sendTeamsNotification(errorMessage);
  }
}

async function submitForm(url) {
  try {
    const response = await axios.get(url);
    const dom = new JSDOM(response.data);

    const submitButton = dom.window.document.querySelector('input[type="submit"]');
    
    if (submitButton) {
      const event = dom.window.document.createEvent('Event');
      event.initEvent('submit', false, true);
      submitButton.dispatchEvent(event);

      const successfulSubmit = `${url} form submission successful.`;
      logToFile(successfulSubmit)
    } else {
      const failedSubmit = `${url} does not have a submit button.`;
      logToFile(failedSubmit)
    }
  } catch (error) {
    const errorMessage = `${url} form submission failed. Error: ${error.message}`;
    logToFile(errorMessage);

    await sendTeamsNotification(errorMessage);
  }
}

async function main() {
  for (const url of urls) {
    await checkAndSubmit(url);
  }
}

main();