# Dashboard with synced To-Do list

A static dashboard (no build step). Sign in with email + password and your
to-do list syncs live across every device. Hosted free on GitHub Pages;
data and login are handled by Firebase (free Spark plan).

## 1. Create the Firebase project (about 5 min)

1. Go to <https://console.firebase.google.com> -> **Add project** (disable Analytics, not needed).
2. **Build -> Authentication -> Get started -> Email/Password -> Enable -> Save.**
3. **Build -> Firestore Database -> Create database** -> pick a region -> start in *production mode*.
4. In Firestore open the **Rules** tab, paste the contents of `firestore.rules`, click **Publish**.
   (This makes each user able to access only their own tasks.)
5. **Project settings (gear icon) -> Your apps -> Web (`</>`)** -> register an app (no hosting).
   Copy the `firebaseConfig` values into `firebase-config.js`.

## 2. Publish on GitHub Pages

1. Create a **public** repo on github.com (e.g. `dashboard`).
2. Upload all files from this folder (**Add file -> Upload files**), commit.
3. **Settings -> Pages -> Deploy from a branch -> main / (root) -> Save.**
4. Your site: `https://<username>.github.io/dashboard/`

## 3. Allow your site to log in

Firebase console -> **Authentication -> Settings -> Authorized domains -> Add domain**:
`<username>.github.io`

## Use it

Open the site on any device, **Create one** an account once, then sign in with the
same email and password everywhere. On a phone, use "Add to Home Screen".

## Local testing

ES modules need a web server (double-clicking `index.html` will not work):

```
python -m http.server 8000
```

then open <http://localhost:8000> (`localhost` is authorized by default).

## Notes

- The Firebase config values are public identifiers, not secrets. Security comes from
  the Firestore rules. To stop strangers from registering, disable sign-ups after
  creating your account: Authentication -> Settings -> User actions -> uncheck
  "Enable create (sign-up)".
