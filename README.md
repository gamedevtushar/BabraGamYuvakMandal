# BabraGamYuvakMandal

Family charity fund: money in, money out, members and monthly reports. Uses the original Astha interface: colour themes, Gujarati/English, text sizing, compact account cards, member contribution tiles, month scrollers, mobile bottom menu and quick add. Includes search, CSV exports and password-gated editing.

## Run

`npm install`, then `npm run dev`. Production: `npm run build`.

## Existing Firestore

Project: `bgym-231a2`. Public web settings are in `src/fundConfig.js`.
The app reuses `members`, `donations`, and `expenses` without migrating or rewriting records.
Donation fields: memberId, memberName, amount, date, month, paymentMode, createdAt.
Expense fields: description, amount, date, paidTo, createdAt.
Member fields: name, occupation, phone, status, createdAt.
Amounts are in rupees. Monthly closing balances include all preceding months.
Historical donation names are preserved when a member name changes.

## Password

`settings/fundAccess` holds a random salt, PBKDF2-SHA256 hash, and iteration count (600000). No plaintext password is stored in source.
Admin login enables editing for the current page session; reload logs out. Menu → Change password verifies the current password and replaces the hash. Existing open admin sessions remain open until reload/logout.
This is a convenience lock, not Firebase Authentication or database authorization. Firestore rules still govern access. Do not deploy the copied society rules to this database.

## GitHub Pages

Repository: https://github.com/gamedevtushar/BabraGamYuvakMandal
Enable Settings → Pages → Source: GitHub Actions. Push to main to build and deploy.
Live URL: https://gamedevtushar.github.io/BabraGamYuvakMandal/
The Firebase public web configuration is included; no FIREBASE_CONFIG secret is needed.
The active app reuses Astha’s `Layout`, `ui`, `theme`, `i18n`, `Backdrop` and `SnapScroller`. Fund-specific screens and forms are in `src/fund/`. Hash routes support GitHub Pages navigation and refresh.
Society reminders and rules deployment have been disabled in this copy.
