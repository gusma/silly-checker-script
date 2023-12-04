const axios = require('axios');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;
require('dotenv').config();
const fs = require('fs');

const urls = [
  process.env.URL_1,
  process.env.URL_2,
  process.env.URL_3
];

const teamsWebhookUrl = process.env.TEAMS_WEBHOOK_URL;

function logToFile(message) {
  const logFilePath = '/path/to/logfile.log';
  fs.appendFileSync(logFilePath, `${new Date().toISOString()}: ${message}\n`);
}

async function sendTeamsNotification(message) {
  try {
    await axios.post(teamsWebhookUrl, {
      text: message,
    });
  } catch (error) {
    console.error(`Error sending Teams notification: ${error.message}`);
  }
}

async function checkAndSubmit(url) {
  try {
    await axios.head(url);
    
    logToFile(`${url} is functioning.`);

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

      console.log(`${url} form submission successful.`);
    } else {
      console.log(`${url} does not have a submit button.`);
    }
  } catch (error) {
    const errorMessage = `${url} form submission failed. Error: ${error.message}`;
    console.error(errorMessage);

    await sendTeamsNotification(errorMessage);
  }
}

async function main() {
  for (const url of urls) {
    await checkAndSubmit(url);
  }
}

main();
