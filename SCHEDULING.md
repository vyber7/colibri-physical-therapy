# Contact first, then schedule

The website's **Request a visit** buttons open a short form. Colibri receives the visitor's contact details, discusses goals, service area, and pricing, then emails a scheduling link. Returning patients can receive the scheduling link directly.

The website no longer embeds Cal.com. `scheduling-config.js` preserves the existing appointment link for reference: `https://cal.com/colibri-physical-therapy/appointment`.

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
  email: 'contact@keysphysicaltherapy.com',
  emailjs: {
    publicKey: 'YOUR_PUBLIC_KEY',
    serviceId: 'YOUR_SERVICE_ID',
    templateId: 'YOUR_TEMPLATE_ID'
  }
};
```

These identifiers are public configuration. Never put an EmailJS private key, email password, or other account credentials in the website. Add the website's production origin to the EmailJS domain allowlist in the dashboard.

## Visitor acknowledgment

Create a second template with **To Email** set to `{{email}}`, **Reply To** set to `contact@keysphysicaltherapy.com`, and the subject `We received your visit request`. Use this body:

```text
Hi {{name}},

Thanks for reaching out to Colibri Physical Therapy. We received your request and will contact you to discuss your visit and next steps. After we connect, we'll email you a link to schedule.

Colibri Physical Therapy
contact@keysphysicaltherapy.com
```

In the clinic notification template's **Auto-Reply** tab, link the acknowledgment template and save. The linked template consumes an additional EmailJS request. Keep the scheduling link out of this acknowledgment so the clinic can review the request first.

## Current behavior

Until all three public identifiers are configured, the form shows **Continue by email** and opens a prefilled email. The visitor must send it; the website never claims it received the request in this mode. No acknowledgment is sent automatically.

With EmailJS configured, the button becomes **Send request**. The website sends the form using EmailJS's REST API and shows confirmation only after EmailJS returns success. Failures and a 15-second timeout preserve the details, re-enable submission, and offer the clinic's email address. The website does not store form details in browser storage.

## Verify delivery

Test validation, desktop/mobile layout, keyboard access, Escape and backdrop closing, editing an email draft, failure/retry, and duplicate-click prevention. Browser mock responses verify the form behavior only. After configuration, make an authorized live test request and verify the notification arrives at the clinic, Reply To targets the visitor, the acknowledgment arrives, and no appointment is automatically booked.

Official references:
- https://www.emailjs.com/docs/tutorial/creating-contact-form/
- https://www.emailjs.com/docs/rest-api/send/
- https://www.emailjs.com/docs/user-guide/auto-reply/
- https://www.emailjs.com/docs/user-guide/dynamic-variables-templates/
