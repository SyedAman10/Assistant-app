import axios from "axios";

const OPENAI_API_KEY = "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"; // Replace with your actual API key
export const transcribeAudio = async (audioData: Blob) => {
  try {
    const formData = new FormData();
    formData.append("file", audioData, "audio.wav");
    formData.append("model", "whisper-1");

    const response = await axios.post("https://api.openai.com/v1/audio/transcriptions", formData, {
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data.text;
  } catch (error) {
    console.error("Error transcribing audio:", error);
    return "Sorry, I couldn't understand.";
  }
};
