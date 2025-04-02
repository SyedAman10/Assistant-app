import { detectIntent } from "../utils/IntentDetection";
import { readEmails, sendEmail } from "../utils/GmailHelper";

export const emailAssistant = async (message: string) => {
  const intent = await detectIntent(message);

  if (intent.includes("read_email")) {
    const emails = await readEmails();
    return emails.length ? emails : "No recent emails found.";
  }

  if (intent.includes("write_email")) {
    // Extract recipient, subject, and body (You can enhance this later with NLP)
    const to = "example@example.com"; // Dummy email for now
    const subject = "Test Subject";
    const body = "This is a test email.";
    return await sendEmail(to, subject, body);
  }

  return "Sorry, I didn't understand that.";
};
