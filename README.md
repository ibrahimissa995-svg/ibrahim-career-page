# Ibrahim Abu Shameh — QR Career Page

A single-file, bilingual (EN/AR) interactive landing page for a QR code on a T-shirt/bag.
No build step, no backend required to run — just `index.html`.

## Files

- `index.html` — the entire site (HTML + Tailwind CDN + vanilla JS)
- `admin.html` — password-gated page to edit all site text (EN + AR) without touching code
- `resumes/` — drop your PDFs here (see `resumes/README.md` for exact filenames)
- `apps-script/Code.gs` — free backend (Google Apps Script) for **site-wide analytics** and **editable content**

## Still to fill in

- [ ] Real resume PDFs in `resumes/` (placeholders wired up already)
- [ ] Change `OWNER_PIN` in `index.html` (`CONFIG.ownerPin`, currently `1234`) before going live
- [ ] Optional: profile photo, contact email/phone, certifications/languages
- [ ] Deploy `apps-script/Code.gs` (see below) and paste the URL into `CONFIG.backendUrl` in **both** `index.html` and `admin.html` — enables site-wide analytics and lets you edit content from `admin.html` instead of editing `index.html` directly

## Editing content (name, about, skills, focus areas, education, resume-role cards) without touching code

Once the backend below is deployed and `CONFIG.backendUrl` is set in both `index.html` and
`admin.html`, open `admin.html` on your deployed site (e.g.
`https://<username>.github.io/<repo-name>/admin.html`), enter your admin secret, and edit any
field in English and/or Arabic. Press **Save changes** — the live site picks it up on next load
(no git commit needed). `admin.html` isn't linked from the site's nav; it's just a direct URL only
you know.

If the backend is ever unreachable, `index.html` falls back to the built-in default text baked
into the file, so the site never breaks.

## One backend, two jobs: analytics + content

By default, visit/click counters are stored in `localStorage`, so the Owner Stats
dashboard only shows activity from whatever single device/browser you open it on, and page
content can only be changed by editing `index.html` directly.

Deploying the shared backend below fixes both: it makes analytics **site-wide** (see everyone's
clicks from any device) and makes content **editable from `admin.html`** instead of code.

1. Go to [sheets.google.com](https://sheets.google.com), create a new blank sheet, name it anything.
2. In the sheet, go to **Extensions → Apps Script**.
3. Delete the placeholder code and paste in the contents of `apps-script/Code.gs`.
4. In the Apps Script editor, click the gear icon (**Project Settings**) → scroll to
   **Script Properties** → **Add script property**. Set the property name to `ADMIN_SECRET` and
   the value to a password of your choice (not `1234` — this is what protects `admin.html`, so
   make it a real, private password only you know).
5. Click **Deploy → New deployment**.
6. Type: **Web app**. Execute as: **Me**. Who has access: **Anyone**.
7. Click **Deploy**, authorize the permissions Google asks for (it's your own script).
8. Copy the **Web app URL** it gives you.
9. In `index.html`, set `CONFIG.backendUrl` to that URL. In `admin.html`, set `CONFIG.backendUrl`
   to the same URL.
10. Commit & push — Owner Stats will now show a "🌐 Site-wide" badge instead of "📱 This device
    only", and `admin.html` will be able to load and save content.

The first time content is requested, the script auto-creates a "Content" sheet/tab seeded with
the current defaults, plus a "ContentHistory" tab that keeps a backup of the previous version
every time you save from `admin.html` — so you can always recover an earlier version by copying
it back out of that tab.

You can also open the Google Sheet directly anytime to see raw analytics counts.

## Hosting on GitHub Pages (free)

See the step-by-step walkthrough in the chat — summary:

1. Create a new GitHub repo (public).
2. Push these files to it.
3. Repo **Settings → Pages** → Source: **Deploy from branch**, branch `main`, folder `/root`.
4. Your site goes live at `https://<username>.github.io/<repo-name>/`.
5. Generate a QR code pointing at that URL and print it.
