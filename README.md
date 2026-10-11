# BabraGamYuvakMandal

Family charity fund: money in, money out, members and monthly reports. Mobile layout, search, CSV exports, and password-gated editing.

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
Expected URL: https://gamedevtushar.github.io/BabraGamYuvakMandal/
The Firebase public web configuration is included; no FIREBASE_CONFIG secret is needed.
The old society UI remains as unused reference files. The active entry is `src/main.jsx` → `src/FundApp.jsx`.
Society reminders and rules deployment have been disabled in this copy.
