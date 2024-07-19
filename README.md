# strava-route-exporter

Simple script that downloads all of the accessible Strava routes for an athlete. Should work for any route types
but it only names bike, run, trail properly.

## Use cases

* Migrating from one exercise platform to another
* Use Strava as a route planner and export to apps like WorkOutDoors for Apple Watch maps

## Get started

Copy the `.env.example` file, name it `.env` and fill in your details from your Strava API settings page.

Install dependencies with `npm i`.

Run `node index.js` each time you want to download the routes to the configure folder.
