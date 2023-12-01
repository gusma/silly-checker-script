const axios = require('axios');
require('dotenv').config();

const urls = [
  process.env.URL_1,
  process.env.URL_2,
  process.env.URL_3
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
    // Perform a simple HTTP HEAD request to check website availability
    await axios.head(url);

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
