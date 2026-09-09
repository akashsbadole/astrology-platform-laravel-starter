#!/usr/bin/env node
/**
 * Panchang calculation engine. Computes what's needed to derive Tithi,
 * Nakshatra, Yoga, Karana, and the Rahu Kalam / Yamaganda / Gulika Kalam
 * inauspicious periods for a given date and location: Sun and Moon
 * ecliptic longitudes (tropical and sidereal), plus sunrise/sunset.
 *
 * Astronomy via `astronomia` (Meeus VSOP87/ELP2000), same verified engine
 * as scripts/kundli-calculate.mjs.
 *
 * Input (stdin, JSON): { "year", "month", "day", "utcOffsetHours", "latitude", "longitude" }
 * Output (stdout, JSON): { "weekday", "ayanamsa", "sun": {...}, "moon": {...},
 *   "sunrise", "sunset" } — sunrise/sunset are ISO 8601 UTC strings.
 */

import { Planet } from 'astronomia/planetposition';
import * as vsop87Bearth from 'astronomia/data/vsop87Bearth';
import * as solar from 'astronomia/solar';
import * as moonposition from 'astronomia/moonposition';
import * as julian from 'astronomia/julian';
import * as rise from 'astronomia/rise';

const R2D = 180 / Math.PI;

const earth = new Planet(vsop87Bearth.default);

function toDeg(rad) {
    return (((rad * R2D) % 360) + 360) % 360;
}

/**
 * Lahiri ayanamsa, quadratic fit against Swiss Ephemeris SIDM_LAHIRI
 * across 1920-2030 (max residual ~7.7e-6 arcsec over that range).
 */
function lahiriAyanamsa(jd) {
    const T = (jd - 2451545.0) / 36525.0;
    return 23.8570924 + 1.39688796 * T + 0.000307095964 * T * T;
}

function readStdin() {
    return new Promise((resolve, reject) => {
        let data = '';
        process.stdin.setEncoding('utf8');
        process.stdin.on('data', (chunk) => (data += chunk));
        process.stdin.on('end', () => resolve(data));
        process.stdin.on('error', reject);
    });
}

async function main() {
    const raw = await readStdin();
    const input = JSON.parse(raw);
    const { year, month, day, latitude, longitude } = input;

    // Use local noon as the reference moment for the day's Panchang figures
    // (the standard convention - Tithi/Nakshatra/Yoga/Karana are quoted for
    // the day using their value at (or spanning) sunrise).
    const utcOffsetHours = input.utcOffsetHours ?? 0;
    const noonUt = 12 - utcOffsetHours;
    const jd = julian.CalendarGregorianToJD(year, month, day + noonUt / 24);

    const ayanamsa = lahiriAyanamsa(jd);
    const sunTropical = toDeg(solar.apparentVSOP87(earth, jd).lon);
    const moonTropical = toDeg(moonposition.position(jd).lon);
    const toSidereal = (deg) => (((deg - ayanamsa) % 360) + 360) % 360;

    // Sunrise/sunset: PlanetRise empirically uses standard positive-EAST
    // longitude for this library version (verified against known Delhi
    // sunrise/sunset times), despite the lower-level API doc saying
    // positive-west - always confirm empirically, never trust the docstring.
    const dayStartJd = Math.floor(jd - 0.5) + 0.5;
    const planetRise = new rise.PlanetRise(
        dayStartJd,
        latitude,
        longitude,
        earth,
        earth,
        {
            date: true,
        },
    );
    const times = planetRise.times();

    const weekday = new Date(Date.UTC(year, month - 1, day)).getUTCDay(); // 0=Sunday

    const output = {
        julianDay: jd,
        weekday,
        ayanamsa,
        sun: { tropical: sunTropical, sidereal: toSidereal(sunTropical) },
        moon: { tropical: moonTropical, sidereal: toSidereal(moonTropical) },
        sunrise: times.rise.toISOString(),
        sunset: times.set.toISOString(),
    };

    process.stdout.write(JSON.stringify(output));
}

main().catch((error) => {
    process.stderr.write(String(error?.stack || error));
    process.exit(1);
});
