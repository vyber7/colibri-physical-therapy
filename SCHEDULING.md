# Appointment scheduling setup

The website is ready to embed a Cal.com event type. Until an event link is configured, visitors see the clinic phone and email instead of a fake confirmation.

## Connect the clinic calendar

1. Create or sign in to the clinic's Cal.com account.
2. Connect the calendar that should be checked for conflicts and set the destination calendar for new bookings.
3. Create an event type for appointments. Set the real duration, location, availability, buffers, and cancellation policy.
4. Under **Advanced → Booking questions**, enable **Phone number** and make it required. Keep medical details out of free-text booking questions unless the clinic has confirmed its compliance requirements with the provider.
5. Copy the event's public URL. In `scheduling-config.js`, set `calLink` to the part after `https://cal.com/`:

   ```js
   window.COLIBRI_SCHEDULING = {
     calLink: 'your-clinic/initial-evaluation'
   };
   ```

No Cal.com API key belongs in this repository.

## Confirmations

- Cal.com sends its default booking confirmation email and calendar invitation after a successful booking. Leave **Disable default confirmation emails for attendees** turned off.
- To send the text confirmation, create a Cal.com Workflow with trigger **When a new event is booked**, action **Send SMS to attendee**, and apply it to the website event type. This requires a Cal.com plan that supports custom workflows/SMS credits.
- Suggested SMS body: `Your {EVENT_NAME} is confirmed for {EVENT_DATE} at {EVENT_TIME} {TIMEZONE_VARIABLE}. Reschedule: {RESCHEDULE_URL}`
- Make a real test booking with a non-clinic email address and mobile number. Confirm the event appears on the clinic calendar, the email/calendar invitation arrives, the SMS arrives, and cancel/reschedule links work.

Cal.com setup reference: https://cal.com/help/workflows/workflowsoverview
