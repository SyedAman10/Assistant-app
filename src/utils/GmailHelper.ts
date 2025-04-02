import axios from "axios";
import EncryptedStorage from "react-native-encrypted-storage";

const GOOGLE_CONTACTS_API = "https://www.googleapis.com/auth/contacts.readonly";
const GMAIL_API = "https://www.googleapis.com/auth/gmail.readonly";

// Function to get user token securely
const getAuthToken = async () => {
  return await EncryptedStorage.getItem("user_token");
};

// 🛠 First: Try fetching email from Contacts API
const fetchFromContactsAPI = async (query: string) => {
  try {
    const token = await getAuthToken();
    const response = await axios.get(
      `https://people.googleapis.com/v1/people:searchContacts?query=${query}&readMask=emailAddresses`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const contacts = response.data.results;
    if (contacts && contacts.length > 0) {
      return contacts[0].emailAddresses?.[0]?.value || null;
    }
  } catch (error) {
    console.error("Contacts API Error:", error);
  }
  return null;
};

// 🛠 Second: Try fetching email from Gmail Inbox
export const fetchFromGmailInbox = async (query: string) => {
  try {
    const token = await getAuthToken();
    const response = await axios.get(
      `https://www.googleapis.com/gmail/v1/users/me/messages?q=${query}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const messages = response.data.messages;
    if (messages && messages.length > 0) {
      // Get sender's email from first matching email
      const messageId = messages[0].id;
      const emailResponse = await axios.get(
        `https://www.googleapis.com/gmail/v1/users/me/messages/${messageId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const headers = emailResponse.data.payload.headers;
      const senderHeader = headers.find((h) => h.name === "From");

      if (senderHeader) {
        const emailMatch = senderHeader.value.match(/<(.+?)>/);
        return emailMatch ? emailMatch[1] : senderHeader.value;
      }
    }
  } catch (error) {
    console.error("Gmail Inbox API Error:", error);
  }
  return null;
};

// 🎯 Final function: Try both methods
export const fetchRecipientEmail = async (query: string) => {
  let email = await fetchFromContactsAPI(query);
  if (!email) {
    email = await fetchFromGmailInbox(query);
  }
  return email;
};
