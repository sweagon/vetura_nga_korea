#!/usr/bin/env node
// scripts/ping-search-engines.mjs
// Pings search engines with the sitemap and submits fresh URLs via IndexNow.
//
// Usage:
//   node scripts/ping-search-engines.mjs
//   SITE_URL=https://veturakoreakosove.com \
//   INDEXNOW_KEY=your-random-key \
//   node scripts/ping-search-engines.mjs
//
// Env:
//   SITE_URL        base URL (default https://veturakoreakosove.com)
//   INDEXNOW_KEY    random key; when set, the key file is written to public/ and
//                   the keyless engines (Bing, Yandex, Seznam, Naver) get fresh URLs.
//   MAX_URLS        max car URLs to submit to IndexNow (default 20)
//
// The IndexNow key file is served from the site root, so it belongs in public/ and
// MUST be committed/pushed BEFORE running for the first time.

import { config as loadDotenv } from 'dotenv';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

loadDotenv({ path: '.env.local' });

const SITE_URL = (process.env.SITE_URL || 'https://veturakoreakosove.com').replace(/\/$/, '');
const SITEMAP_URL = `${SITE_URL}/sitemap.xml`;
const MAX_URLS = Number(process.env.MAX_URLS || 20);
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

const results = [];

async function ping(name, url, init) {
    try {
        const res = await fetch(url, init);
        results.push({ name, status: res.status, ok: res.ok, note: (await res.text()).slice(0, 200) });
    } catch (err) {
        results.push({ name, status: 'ERR', ok: false, note: String(err.message || err) });
    }
}

async function main() {
    console.log(`SEO ping for ${SITE_URL}\nSitemap: ${SITEMAP_URL}\n`);

    // 1) Make sure the sitemap is actually served before telling anyone about it.
    const sitemapCheck = await fetch(SITEMAP_URL).catch(() => null);
    if (!sitemapCheck || !sitemapCheck.ok) {
        console.error(`✗ Sitemap not reachable at ${SITEMAP_URL} — deploy first, then re-run.`);
        process.exit(1);
    }
    console.log('✓ Sitemap reachable');

    // Note: Google/Bing deprecated their `<search-engine>.com/ping` endpoints in 2023,
    // so there is no public "ping" anymore. Discovery now happens through:
    //   1) the <Sitemap> line in robots.txt (Google/Bing read it automatically), and
    //   2) IndexNow submit below (instant for Bing, Yandex, Seznam, Naver + partners).
    // Google is additionally covered once by submitting the sitemap in Search Console.

    // 2) IndexNow - instant URL submission for Bing, Yandex, Seznam, Naver, etc.
    const key = process.env.INDEXNOW_KEY;
    if (key) {
        const keyFile = path.join(ROOT, 'public', `${key}.txt`);
        try {
            fs.writeFileSync(keyFile, key, 'utf8');
            console.log(`✓ IndexNow key file written: public/${key}.txt (commit & push it)`);
        } catch (err) {
            console.error(`✗ Could not write key file: ${err.message}`);
        }

        const urlList = [`${SITE_URL}/`, `${SITE_URL}/cars`];
        try {
            const res = await fetch(SITEMAP_URL);
            const xml = await res.text();
            const matches = xml.matchAll(/<loc>(https?:\/\/[^<]+\/cars\/\d+)<\/loc>/g);
            for (const m of matches) {
                if (urlList.length >= MAX_URLS + 2) break;
                urlList.push(m[1]);
            }
        } catch (err) {
            console.error(`✗ Could not read sitemap for IndexNow URLs: ${err.message}`);
        }

        console.log(`\nSubmitting ${urlList.length} URLs to IndexNow...`);
        await ping('IndexNow', 'https://api.indexnow.org/indexnow', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json; charset=utf-8' },
            body: JSON.stringify({
                host: new URL(SITE_URL).host,
                key,
                keyLocation: `${SITE_URL}/${key}.txt`,
                urlList,
            }),
        });
    } else {
        console.log('\n(INDEXNOW_KEY not set — skipping IndexNow submission. Set env + commit public/<key>.txt to enable.)');
    }

    console.log('\n--- Results ---');
    let okCount = 0;
    for (const r of results) {
        const flag = r.ok ? '✓' : '✗';
        if (r.ok) okCount++;
        console.log(`${flag} ${r.name}: ${r.status} ${r.ok ? '' : r.note}`);
    }
    const total = results.length;
    console.log(total === 0 ? 'Nothing to submit (set INDEXNOW_KEY).' : `${okCount}/${total} submissions succeeded.`);
    process.exit(total > 0 && okCount !== total ? 1 : 0);
}

main();