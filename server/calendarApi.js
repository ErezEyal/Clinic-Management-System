const fs = require("fs");
const readline = require("readline");
const { google } = require("googleapis");

const SCOPES = ["https://www.googleapis.com/auth/calendar"];
const TOKEN_PATH = "token.json";
let authClient = null;
let calendar = null;

const calendars = {
  main: process.env.MAIN_CALENDAR_ID,
  second: process.env.SECOND_CALENDAR_ID,
  third: process.env.THIRD_CALENDAR_ID,
};

fs.readFile("credentials.json", (err, content) => {
  if (err) return console.log("Error loading client secret file:", err);
  authorize(JSON.parse(content));
});

const authorize = (credentials) => {
  const { client_secret, client_id, redirect_uris } = credentials.web;
  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0]
  );

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getAccessToken(oAuth2Client);
    oAuth2Client.setCredentials(JSON.parse(token));
    authClient = oAuth2Client;
    calendar = google.calendar({ version: "v3", authClient });
  });
};

const getAccessToken = (oAuth2Client) => {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
  });
  console.log("Authorize this app by visiting this url:", authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question("Enter the code from that page here: ", (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error("Error retrieving access token", err);
      oAuth2Client.setCredentials(token);
      authClient = oAuth2Client;
      calendar = google.calendar({ version: "v3", authClient });
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) return console.error(err);
        console.log("Token stored to", TOKEN_PATH);
      });
    });
  });
};

const getEvents = async (startDate, endDate, calendarName, filter) => {
  const auth = authClient;
  const calendar = google.calendar({ version: "v3", auth });
  return calendar.events
    .list({
      calendarId: calendars[calendarName],
      timeMin: new Date(startDate).toISOString(),
      timeMax: new Date(endDate).toISOString(),
      maxResults: 1000,
      singleEvents: true,
      orderBy: "startTime",
      q: filter
    })
    .then((response) => {
      // console.log("nextPageToken: ", response.data.nextPageToken)
      return response.data.items;
    })
    .catch((err) => {
      console.error(err);
      return [];
    });
};

const createEvent = (eventDetails, calendarName) => {
  const event = {
    calendarId: calendars[calendarName],
    resource: eventDetails,
  };

  const auth = authClient;
  const calendar = google.calendar({ version: "v3", auth });
  console.log("\n Adding the following event:", eventDetails);
  return calendar.events
    .insert(event)
    .then((response) => {
      return response;
    })
    .catch((err) => {
      console.error(err);
      return { error: "true" };
    });
};

const updateEvent = (eventDetails, calendarName) => {
  const eventId = eventDetails.id;
  delete eventDetails.id;
  const event = {
    calendarId: calendars[calendarName],
    eventId: eventId,
    resource: eventDetails,
  };

  const auth = authClient;
  const calendar = google.calendar({ version: "v3", auth });
  console.log("\n Updating the following event:", eventDetails);
  return calendar.events
    .patch(event)
    .then((response) => {
      return response;
    })
    .catch((err) => {
      console.error(err);
      return { error: "true" };
    });
};

const deleteEvent = (eventId, calendarName) => {
  const data = {
    calendarId: calendars[calendarName],
    eventId: eventId,
  };
  const auth = authClient;
  const calendar = google.calendar({ version: "v3", auth });
  console.log("\n Deleting the following event:", data);
  return calendar.events
    .delete(data)
    .then((response) => {
      return response;
    })
    .catch((err) => {
      console.error(err);
      return { error: "true" };
    });
};

module.exports = {
  getEvents,
  createEvent,
  updateEvent,
  deleteEvent,
};
