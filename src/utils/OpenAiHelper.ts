
import axios from "axios";
import fs from 'react'
export const openaiAudioTranscription = async (audioPath: string): Promise<string> => {
  try {
    // Read the audio file as base64
    const audioFile = await fs.readFile(audioPath, 'base64');
    
    const response = await axios.post(
      'https://api.openai.com/v1/audio/transcriptions',
      {
        file: `data:audio/m4a;base64,${audioFile}`,
        model: "whisper-1"
      },
      {
        headers: {
          'Authorization': `Bearer YOUR_OPENAI_API_KEY`,
          'Content-Type': 'multipart/form-data'
        }
      }
    );
    
    return response.data.text;
  } catch (error) {
    console.error('OpenAI transcription error:', error);
    throw error;
  }
};
export const detectIntent = async (userInput: string) => {
  try {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `Classify user input into one of these categories:
            - "Google Calendar" (if it's related to scheduling events, reminders, or checking calendar)
            - "Gmail" (if it's related to reading, sending, or managing emails)
            - "Google Classroom" (if it's about assignments, grades, or class updates)
            - "General Query" (if it doesn't fit any category)`,
          },
          { role: "user", content: `User Input: "${userInput}". Detect category and provide only the category name.` },
        ],
        max_tokens: 10,
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data.choices[0].message.content.trim();
  } catch (error) {
    console.error("Error detecting intent:", error);
    return "Unknown";
  }
};
