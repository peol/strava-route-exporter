import dotenv from 'dotenv'; dotenv.config(); // before strava module
import { promises as fs } from 'fs';
import strava from 'strava-v3';

const PREFIXES = {
    1: 'bike',
    2: 'run',
    5: 'trail',
};

const createFilename = (str) =>
    str.toLowerCase()
        .replace(/[^\sa-z0-9åäö/-]/g, '')
        .trim()
        .replace(/\s|\//g, '_');

const downloadRoute = async (client, routeId) => {
    return new Promise((resolve, reject) => {
        client.routes.getFile({ id: routeId, file_type: 'gpx' }, (err, data) => {
            if (err) return reject(err);
            return resolve(data);
        });
    });
};

const tokens = await strava.oauth.refreshToken(process.env.STRAVA_REFRESH_TOKEN);
const client = new strava.client(tokens.access_token);
const routes = await client.athlete.listRoutes({ id: process.env.STRAVA_ATHLETE_ID, per_page: 100 });
await fs.mkdir(process.env.STORAGE_PATH, { recursive: true });

for (const { type, name, id_str } of routes) {
    const filename = `${process.env.STORAGE_PATH}/${PREFIXES[type] || 'unknown'}_${createFilename(name)}.gpx`;
    const route = await downloadRoute(client, id_str);
    await fs.writeFile(filename, route, 'utf-8');
    console.log('Downloaded route', filename);
}
