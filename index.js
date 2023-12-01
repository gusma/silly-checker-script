const axios = require('axios');
const puppeteer = require('puppeteer');
require('dotenv').config();

const urls = [
  '#',
  '#',
  '#',
];

const teamsWebhookUrl = process.env.TEAMS_WEBHOOK_URL;

async function sendTeamsNotification(message) {
  try {
    await axios.post(teamsWebhookUrl, {
      text: message,
    });
  } catch (error) {
    console.error(`Error sending Teams notification: ${error.message}`);
  }
}

async function checkWebsite(url) {
  try {
    await axios.head(url);

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url);
    
    await page.click('input[type="submit"][value="Login"]');
    await browser.close();

    console.log(`${url} is functioning.`);
  } catch (error) {
    const errorMessage = `${url} is not functioning. Error: ${error.message}`;
    console.error(errorMessage);

    await sendTeamsNotification(errorMessage);
  }
}

async function main() {
  for (const url of urls) {
    await checkWebsite(url);
  }
}

main();