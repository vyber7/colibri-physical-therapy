# Contact first, then schedule

The website's **Request a visit** buttons open a short form. Colibri receives the visitor's contact details, discusses goals, service area, and pricing, then schedules a visit.

## Form fields and configuration

The form requires a name, email address, phone number, and ZIP code (five digits or ZIP+4). The message is optional. Field lengths are limited to 120 characters for name, 254 for email, 40 for phone, 10 for ZIP code, and 2,000 for the message. Visitors are asked to keep medical details for their conversation with the therapist.

[`contact-config.js`](contact-config.js) currently contains all three public EmailJS identifiers and uses `contact@keysphysicaltherapy.com` as the contact address. This enables **Send request** in the browser; it does not establish whether dashboard settings or inbox delivery have been verified. The notification recipient and visitor acknowledgment are configured in EmailJS, not in this file. If the clinic's email changes, update the dashboard templates and the hardcoded email links in [`index.html`](index.html) and [`legal.html`](legal.html) as well.

## Set up EmailJS

1. Create an account at https://www.emailjs.com/ and add an email service under **Email Services**. Connect the clinic's sending email account and use EmailJS's test function to verify the service.
2. Under **Email Templates**, create a notification template with these settings:
   - **To Email:** `contact@keysphysicaltherapy.com` (fixed in the dashboard, not supplied by visitors).
   - **From Name:** `Colibri website`.
   - **From Email:** the connected service's default sender.
   - **Reply To:** `{{reply_to}}` so the clinic can reply to the visitor.
   - **Subject:** `New visit request from {{name}}`.
3. Use the following template body. Insert variables using ordinary double braces, which escape their values; do not use triple braces for visitor content.

```text
New visit request

Name: {{name}}
Email: {{email}}
Phone: {{phone}}
ZIP code: {{zip}}

Message:
{{message}}

Reply to this email to discuss the visit. Send the scheduling link after the initial conversation.
```

4. Copy the **Service ID**, **Template ID**, and **Public Key** (under Account) into `contact-config.js`:

```js
window.COLIBRI_CONTACT = window.COLIBRI_CONTACT || {
  email: "contact@keysphysicaltherapy.com",
  emailjs: {
    publicKey: "YOUR_PUBLIC_KEY",
    serviceId: "YOUR_SERVICE_ID",
    templateId: "YOUR_TEMPLATE_ID",
  },
};
```

These identifiers are public configuration. Never put an EmailJS private key, email password, or other account credentials in the website. Add the website's production origin to the EmailJS domain allowlist in the dashboard. For a live local delivery test, also allow the exact local origin, such as `http://127.0.0.1:8080`; include the scheme, hostname, and port where applicable.

The site calls EmailJS's REST API directly; no EmailJS SDK is loaded. It sends `name`, `email`, `phone`, `zip`, `message`, and `reply_to` as template parameters, with `reply_to` set to the visitor's email. Leading and trailing whitespace is removed from field values.

## Visitor acknowledgment

Create a second template with **To Email** set to `{{email}}`, **Reply To** set to `contact@keysphysicaltherapy.com`, and the subject `We received your visit request`. Use this body:

```text
Hi {{name}},

Thanks for reaching out to Colibri Physical Therapy. We received your request and will contact you to discuss your visit and next steps. After we connect, we'll schedule an appointment.

Colibri Physical Therapy
contact@keysphysicaltherapy.com
```

In the clinic notification template's **Auto-Reply** tab, link the acknowledgment template and save. EmailJS also calls this feature **Linked Template**. The linked template consumes an additional EmailJS request. Keep the scheduling link out of this acknowledgment so the clinic can review the request first.

## Current behavior

If any of the three public identifiers is missing, empty, or whitespace-only, the form shows **Continue by email** and opens a prefilled email. The visitor must send it; the website never claims it received the request in this mode. The dialog provides **Open email app** to reopen the draft and **Edit details** to return to the form. No acknowledgment is sent automatically.

With EmailJS configured, the button becomes **Send request**. While sending, the button is disabled and shows **Sending…** to prevent duplicate submissions. The website shows confirmation only after an HTTP success response whose trimmed body is `OK`. This confirms API acceptance, not inbox delivery. Failures and a 15-second timeout preserve the details, re-enable submission, and offer the clinic's email address; they do not automatically open an email draft. The website does not store form details in browser storage.

## Verify delivery

Run the layout and dialog smoke check described in [`README.md`](README.md#verify-changes). It does not submit the form or verify delivery. Also check:

- Required fields, email format, ZIP and ZIP+4 validation, and a whitespace-only name.
- Desktop/mobile layout, keyboard focus and focus return, Escape and backdrop closing, and the mobile menu.
- The email-draft fallback using a temporary local configuration with an empty EmailJS identifier, including **Open email app** and **Edit details**. Restore the intended configuration afterward.
- With mocked EmailJS responses: successful confirmation, failure/retry, the 15-second timeout, preservation of entered details on failure, and duplicate-click prevention while sending.
- After configuration, an authorized live test request: verify the notification arrives at the clinic, Reply To targets the visitor, the acknowledgment arrives if enabled, and no appointment is automatically booked. Check EmailJS Email History for both the main and linked templates when troubleshooting.

Mock responses verify browser behavior only. Dashboard settings, event availability, and live email delivery cannot be verified from the repository alone.

Official references:

- [Contact form tutorial](https://www.emailjs.com/docs/tutorial/creating-contact-form/)
- [REST API: send](https://www.emailjs.com/docs/rest-api/send/)
- [Auto-Reply and Linked Template](https://www.emailjs.com/docs/user-guide/auto-reply/)
- [Dynamic variables in templates](https://www.emailjs.com/docs/user-guide/dynamic-variables-templates/)
- [Domain allowlist](https://www.emailjs.com/docs/faq/can-i-add-my-domain-to-allowlist/)
