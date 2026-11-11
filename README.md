# HOSTEL Design Demo

Public synthetic design-review screens only, separate from the private application repository. No actual registration, password authentication, credential changes, email delivery, applications or payment processing. Use fictional inputs.

Open the GitHub Pages homepage for the latest clickable workflow inventory. Each screen under workflows/ is a separate HTML document with shared CSS/JavaScript. Inventory scenarios prepare synthetic accounts in a dedicated browser localStorage record; passwords are never persisted. Normal browser data is not cleared.

Registration, email verification, login, password reset and profile setup/view/edit have received detailed review; remaining workflows include proposals. A reset demo email is generated only for an existing synthetic account: start a sample account from the workflow inventory or register one first. Sending limits are simulated locally. Fixed verification codes and predictable reset identifiers are for review only, not production security.

Published files are limited to the legacy gallery (index.html, account.html, jobs.html, jobs-en.html, .nojekyll), workflows/*.html from the reviewed page manifest, workflows/assets/workflow.css, workflows/assets/workflow.js, a compatibility redirect for workflows/verified.html, and this README. The redirect is not an active success screen; successful verification navigates directly to profile setup or the intended action/home. No private repository history, planning documents, discussion sources, application backend, credentials or real-user data are published. Existing legacy links remain available.

GitHub Pages publishes from main/root. The static app makes no external network requests. Browser storage is a design simulation, not an authentication boundary.
