import dotenv from 'dotenv';
import { promises as fs } from 'fs';
import { fetchAllEntries, fetchToken, request } from './strava.js';

dotenv.config();

const {
  STRAVA_CLIENT_ID,
  STRAVA_CLIENT_SECRET,
  STRAVA_REFRESH_TOKEN,
  STRAVA_ATHLETE_ID,
  STORAGE_PATH,
} = process.env;

// mapping of numerical strava activity types
const PREFIXES = {
  1: 'bike',
  2: 'run',
  5: 'trail',
};

// creates a safe and "standardized" filename
const createFilename = (type, name) =>
  `${STORAGE_PATH}/${PREFIXES[type] || 'unknown'}_${
      name
        .toLowerCase()
        .replace(/[^\sa-z0-9åäö/-]/g, '')
        .trim()
        .replace(/\s|\//g, '_')
      }.gpx`;

// retrieve an oauth access token
const { access_token } = await fetchToken(STRAVA_CLIENT_ID, STRAVA_CLIENT_SECRET, STRAVA_REFRESH_TOKEN);

// get an array of all routes for the athlete
const routes = await fetchAllEntries(access_token, `/athletes/${STRAVA_ATHLETE_ID}/routes`);

await fs.mkdir(STORAGE_PATH, { recursive: true });

// loop through each route and download the gpx file for it
for (const route of routes) {
  const { type, name, id_str } = route;
  const filename = createFilename(type, name);
  const data = await request(access_token, `/routes/${id_str}/export_gpx`);
  await fs.writeFile(filename, data, 'utf-8');
  console.log('Downloaded route', filename);
}
