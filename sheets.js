const { google } = require('googleapis');
const sheets = google.sheets('v4');
const fs = require('fs');
const credentials = JSON.parse(fs.readFileSync('service-account-file.json'));
async function authorize() {
    const auth = new google.auth.GoogleAuth({
        credentials: credentials,
        scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
    });
    return await auth.getClient();
}

async function getSheetData(sheetId, range) {
    const authClient = await authorize();

    const response = await sheets.spreadsheets.values.get({
        auth: authClient,
        spreadsheetId: sheetId,
        range: range,
    });

    return response.data.values;
}

module.exports = {
    getSheetData
};
