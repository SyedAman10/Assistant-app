import axios from "axios";

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
