const axios = require('axios');
const fs = require('fs');
const https = require('https');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, './.env') });

const teamsWebhookUrl = process.env.TEAMS_WEBHOOK_URL;

process.env.HTTP_PROXY = '';
process.env.HTTPS_PROXY = '';

async function sendTeamsNotification(message) {
    try {
      await axios.post(
        teamsWebhookUrl,
        { text: message },
        {
          httpsAgent: new https.Agent({ keepAlive: true }),
        }
      );
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