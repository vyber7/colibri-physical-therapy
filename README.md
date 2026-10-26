# Colibrí Physical Therapy

A responsive website for Colibrí Physical Therapy, serving the Upper Keys and Miami. Visitors can explore services, meet the therapist, read FAQs, and request a visit.

Built with plain HTML, CSS, and JavaScript. There is no build step, application server, or package manifest. The site uses Google Fonts and sends visit requests through EmailJS when configured.

## Run locally

From the repository root, start a static server with Python 3:

```sh
python3 -m http.server 8080 --bind 127.0.0.1
```

Open [http://127.0.0.1:8080](http://127.0.0.1:8080). Changes are available after refreshing the page. Stop the server with `Ctrl+C`.

Node.js is only needed for the optional browser checks below.

## Project files

- [`index.html`](index.html): Homepage content, navigation, and visit request dialog.
- [`legal.html`](legal.html): Privacy Policy and Terms of Use.
- [`styles.css`](styles.css): Shared styles, theme variables, and responsive layouts.
- [`script.js`](script.js): Mobile menu, dialog behavior, form validation, and request delivery.
- [`contact-config.js`](contact-config.js): Contact email and public EmailJS identifiers.
- [`scheduling-config.js`](scheduling-config.js): Retained Cal.com configuration; the current website does not load this file or embed a booking calendar.
- [`assets/`](assets/): Brand mark, hero image, therapist portrait, and favicon.
  The page serves `profile-pic.webp`, a compressed portrait with the original dimensions and transparency. Keep `profile-pic.png` as the source for future edits.
- [`SCHEDULING.md`](SCHEDULING.md): EmailJS templates, acknowledgment setup, and delivery verification.
- [`verify-site.mjs`](verify-site.mjs): Playwright checks for desktop and mobile layouts and the visit request dialog.
- [`artifacts/`](artifacts/): Saved screenshots for visual reference.

## Visit requests

The **Request a visit** buttons open a contact form. Colibrí reviews the request, discusses the visit with the visitor, and then shares a scheduling link. Submitting the form does not book an appointment.

The form requires a name, email address, phone number, and ZIP code (five digits or ZIP+4). The message is optional, and visitors are asked to keep medical details for their conversation with the therapist.

Configure `email`, `emailjs.publicKey`, `emailjs.serviceId`, and `emailjs.templateId` in `contact-config.js`. The repository currently contains all three public EmailJS identifiers, so the form uses **Send request** by default. Their presence does not verify the service, template, or inbox delivery. Use the intended service and template for your deployment. Keep private keys and email account credentials out of these client-side files.

- With all three EmailJS identifiers present, the form submits to EmailJS and displays confirmation after an HTTP success response with an `OK` body. Inbox delivery must be verified separately.
- If any identifier is empty or missing, **Continue by email** opens a prefilled email draft that the visitor must send. The dialog also offers **Open email app** and **Edit details**.
- Delivery failures or a 15-second timeout preserve the entered details and show an email contact link.

Follow [`SCHEDULING.md`](SCHEDULING.md) to configure the recipient, Reply To address, optional visitor acknowledgment, and production domain allowlist. Acknowledgments depend on EmailJS dashboard configuration.

## Verify changes

For the existing browser smoke check, install Node.js and npm, then install Playwright and Chromium:

```sh
npm install --no-save --package-lock=false playwright@1.55.0
npx playwright install chromium
```

Keep the local server running on port 8080. In a second terminal, run:

```sh
node verify-site.mjs
```

The script checks desktop (1440 × 1000) and mobile (390 × 844) viewports for console/page errors, horizontal overflow, dialog opening and closing, initial focus, required-field validation, and modal layout. It also checks that the old embedded calendar is absent. It does not submit the form or verify email delivery.

For visual changes, review both pages at desktop and mobile widths. In the therapist section, check the portrait's proportions and spacing: desktop places the portrait beside the copy; widths of 860px and below place the heading above the centered portrait and details. The smoke check does not verify that arrangement or refresh the saved screenshots. For form changes, also follow the manual validation and delivery checklist in [`SCHEDULING.md`](SCHEDULING.md).

## Deploy

Serve the following files and directory from the same root on a static host:

```text
index.html
legal.html
styles.css
script.js
contact-config.js
assets/
```

No build command is required. Keep asset paths intact, serve the production site over HTTPS, and add its origin to the EmailJS domain allowlist. The site loads fonts from Google Fonts and, when configured, sends requests to `https://api.emailjs.com`.
