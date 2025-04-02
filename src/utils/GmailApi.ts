import axios from "axios";
import EncryptedStorage from "react-native-encrypted-storage";

export const getGmailContacts = async (name: string) => {
  try {
    // Retrieve the stored access token
    const storedToken = await EncryptedStorage.getItem("user_token");

    if (!storedToken) {
      console.error("No access token found.");
      return null;
    }

    // Make API request to get contact details
    const response = await axios.get(
      `https://people.googleapis.com/v1/people:searchContacts?query=${name}&readMask=emailAddresses,names`,
      {
        headers: {
          Authorization: `Bearer ${storedToken}`, // Use stored OAuth token
        },
      }
    );

    const contacts = response.data.results;
    if (contacts.length > 0) {
      return contacts[0].emailAddresses?.[0]?.value || null;
    }
    return null;
  } catch (error) {
    console.error("Error fetching contacts:", error.response?.data || error);
    return null;
  }
};
