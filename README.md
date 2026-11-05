# Ryn's Realm Configuration Hub

Static GitHub Pages site. No packages, player accounts, or credentials are needed.

## Publish

1. Create a **public**, empty repository named `ryns-realm-configs` under `itsRynsRoblox`.
2. Upload only the contents of this folder to the repository root. Do not upload the macro's Settings, Logs, or source directory.
3. Under **Settings → Pages**, select **Deploy from a branch**, branch **main**, folder **/(root)**, and Save.
4. The expected URL is https://itsRynsRoblox.github.io/ryns-realm-configs/ . Wait for the Pages deployment to finish before sharing it.

The macro opens the public URL, filtered to the selected card mode, so players always see the latest published catalog. This folder does not need to be bundled with releases.

## Add a reviewed preset

Edit `catalog.js`. Each entry contains a unique lowercase/hyphen `id`, `name`, `author`, `description`, `mode`, `type: "CardPriority"`, and `data`: an ordered array of card keys. To obtain the array, decode a Card Priority export's `RR-` Base64 JSON and use its `data`. Never execute submitted scripts or accept bot tokens, webhook URLs, or entire Settings exports.

Keep examples clearly labeled; starter presets reproduce the macro's default order and do not claim to be optimized strategies. Import into the matching mode. The current RR format does not encode a mode; the macro normalizes unknown cards against the selected mode's supported cards.

Run `node check.cjs` in this folder before publishing. The page works directly from `index.html` as well as on Pages. Downloaded `.txt` files contain share codes: players open the file and paste its content into Card Priority → Import.

Submissions use GitHub issues and are manually reviewed. Importing backs up the previous card priority file to `<filename>.bak`; each subsequent import replaces that backup.

