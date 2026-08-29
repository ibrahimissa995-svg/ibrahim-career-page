# Ibrahim Abu Shameh — QR Career Page

A single-file, bilingual (EN/AR) interactive landing page for a QR code on a T-shirt/bag.
No build step, no backend required to run — just `index.html`.

## Files

- `index.html` — the entire site (HTML + Tailwind CDN + vanilla JS)
- `resumes/` — drop your PDFs here (see `resumes/README.md` for exact filenames)
- `apps-script/Code.gs` — optional free backend for **site-wide** (shared) analytics

## Still to fill in

- [ ] Education: university name & year (`index.html`, "Education" section — currently `[Add university & year]`)
- [ ] Real resume PDFs in `resumes/` (placeholders wired up already)
- [ ] Change `OWNER_PIN` in `index.html` (`CONFIG.OWNER_PIN`, currently `1234`) before going live
- [ ] Optional: profile photo, contact email/phone, certifications/languages
- [ ] Optional: deploy `apps-script/Code.gs` and paste the URL into `CONFIG.ANALYTICS_ENDPOINT`

## Analytics: local vs. site-wide

By default, visit/click counters are stored in `localStorage`, so the Owner Stats
dashboard only shows activity from whatever single device/browser you open it on.

To make it **site-wide** (see everyone's clicks from any device):

1. Go to [sheets.google.com](https://sheets.google.com), create a new blank sheet, name it anything.
2. In the sheet, go to **Extensions → Apps Script**.
3. Delete the placeholder code and paste in the contents of `apps-script/Code.gs`.
4. Click **Deploy → New deployment**.
5. Type: **Web app**. Execute as: **Me**. Who has access: **Anyone**.
6. Click **Deploy**, authorize the permissions Google asks for (it's your own script).
7. Copy the **Web app URL** it gives you.
8. In `index.html`, set `CONFIG.ANALYTICS_ENDPOINT` to that URL.
9. Commit & push — Owner Stats will now show a "🌐 Site-wide" badge instead of "📱 This device only".

You can also open the Google Sheet directly anytime to see raw counts.

## Hosting on GitHub Pages (free)

See the step-by-step walkthrough in the chat — summary:

1. Create a new GitHub repo (public).
2. Push these files to it.
3. Repo **Settings → Pages** → Source: **Deploy from branch**, branch `main`, folder `/root`.
4. Your site goes live at `https://<username>.github.io/<repo-name>/`.
5. Generate a QR code pointing at that URL and print it.
