const axios = require('axios');
const fs = require('fs');
require('dotenv').config();

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

function readAndSendLog() {
  const logFilePath = 'logfile.log';
  try {
    const logContent = fs.readFileSync(logFilePath, 'utf8');
    if (logContent.trim() !== '') {
      sendTeamsNotification('Daily Log Information:\n' + logContent);
      fs.writeFileSync(logFilePath, '');
    }
  } catch (error) {
    console.error(`Error reading log file: ${error.message}`);
  }
}

readAndSendLog();