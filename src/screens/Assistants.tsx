
// import React, { useState } from "react";
// import { View, TextInput, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator } from "react-native";
// import { Text, Button } from "react-native-paper";
// import Icon from "react-native-vector-icons/MaterialCommunityIcons";
// import { detectIntent } from "../utils/OpenAiHelper";
// import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";


// const AssistantsScreen: React.FC = () => {
//   const [input, setInput] = useState("");
//   const [intent, setIntent] = useState<string | null>(null);
//   const [loading, setLoading] = useState(false);

//   const handleDetectIntent = async () => {
//     if (!input.trim()) return;
    
//     setLoading(true);
//     const detectedIntent = await detectIntent(input);
//     setIntent(detectedIntent);
//     setLoading(false);
//   };

//   return (
//     <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.container}>
//       <Text style={styles.title}>Ask Your Assistant</Text>
//       <View style={styles.inputContainer}>
//         <TextInput
//           style={styles.input}
//           placeholder="Type your request..."
//           value={input}
//           onChangeText={setInput}
//         />
//         {/* 🎙️ Detect Intent Button */}
//         <TouchableOpacity style={styles.micButton} onPress={handleDetectIntent}>
//         <MaterialCommunityIcons name="send" size={24} color="white" />

//      </TouchableOpacity>
//       </View>
      
//       {/* Show Loading Indicator */}
//       {loading && <ActivityIndicator size="large" color="#4285F4" style={{ marginTop: 10 }} />}

//       {/* Display Detected Intent */}
//       {intent && !loading && (
//         <View style={styles.resultContainer}>
//           <Text style={styles.intentText}>Intent: {intent}</Text>
//         </View>
//       )}
//     </KeyboardAvoidingView>
//   );
// };

// const styles = StyleSheet.create({
//   container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F5F5F5", padding: 20 },
//   title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
//   inputContainer: { flexDirection: "row", alignItems: "center", width: "100%", backgroundColor: "white", borderRadius: 10, padding: 10, elevation: 3 },
//   input: { flex: 1, fontSize: 16 },
//   micButton: { marginLeft: 10, backgroundColor: "#4285F4", padding: 10, borderRadius: 50 },
//   resultContainer: { marginTop: 20, padding: 15, backgroundColor: "white", borderRadius: 10, elevation: 3 },
//   intentText: { fontSize: 18, fontWeight: "600", color: "#333" },
// });

// export default AssistantsScreen;
import React, { useState, useEffect } from "react";
import { View, TextInput, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator, PermissionsAndroid, Alert, Text } from "react-native";
import { detectIntent } from "../utils/OpenAiHelper";
import { Audio } from '@react-native-community/audio-toolkit';
import RNFS from 'react-native-fs';

// Add this function to your OpenAiHelper.ts file
const transcribeAudio = async (audioPath: string): Promise<string> => {
  try {
    const formData = new FormData();
    const audioFile = {
      uri: 'file://' + audioPath,
      type: 'audio/m4a',
      name: 'recording.m4a',
    };
    
    // @ts-ignore
    formData.append('file', audioFile);
    formData.append('model', 'whisper-1');
    
    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'multipart/form-data',
      },
      body: formData,
    });

    const data = await response.json();
    return data.text;
  } catch (error) {
    console.error('Error transcribing audio:', error);
    return '';
  }
};

const AssistantsScreen: React.FC = () => {
  const [input, setInput] = useState("");
  const [intent, setIntent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recorder, setRecorder] = useState<any>(null);
  const [recordingPath, setRecordingPath] = useState("");
  
  useEffect(() => {
    // Clean up resources when component unmounts
    return () => {
      if (recorder) {
        recorder.destroy();
      }
    };
  }, [recorder]);

  const requestMicrophonePermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            title: "Microphone Permission",
            message: "App needs access to your microphone to record audio",
            buttonNeutral: "Ask Me Later",
            buttonNegative: "Cancel",
            buttonPositive: "OK"
          }
        );
        
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          console.log("Microphone permission granted");
          return true;
        } else {
          console.log("Microphone permission denied");
          Alert.alert(
            "Permission Required", 
            "Microphone access is needed for voice input. Please enable it in app settings.",
            [{ text: "OK" }]
          );
          return false;
        }
      } catch (err) {
        console.warn("Error requesting microphone permission:", err);
        return false;
      }
    } else {
      // iOS permission is handled by the Audio library
      return true;
    }
  };

  const startRecording = async () => {
    const hasPermission = await requestMicrophonePermission();
    if (!hasPermission) {
      console.error("No microphone permission granted");
      return;
    }
    
    setIsRecording(true);
    
    // Create recording file path
    const path = `${RNFS.CachesDirectoryPath}/recording.m4a`;
    setRecordingPath(path);
    
    // Initialize recorder
    const newRecorder = new Audio.Recorder();
    setRecorder(newRecorder);
    
    try {
      await newRecorder.prepare();
      await newRecorder.record();
    } catch (error) {
      console.error('Failed to start recording', error);
      setIsRecording(false);
    }
  };

  const stopRecording = async () => {
    if (!recorder) return;
    
    try {
      await recorder.stop();
      setIsRecording(false);
      
      // Process the recording
      setLoading(true);
      const transcription = await transcribeAudio(recordingPath);
      setInput(transcription);
      
      // Detect intent with the transcribed text
      if (transcription) {
        const detectedIntent = await detectIntent(transcription);
        setIntent(detectedIntent);
      }
      
      setLoading(false);
      
      // Clean up
      recorder.destroy();
      setRecorder(null);
    } catch (error) {
      console.error('Failed to stop recording', error);
      setIsRecording(false);
      setLoading(false);
    }
  };

  const handleDetectIntent = async () => {
    if (!input.trim()) return;
    
    setLoading(true);
    const detectedIntent = await detectIntent(input);
    setIntent(detectedIntent);
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.container}>
      <Text style={styles.title}>Ask Your Assistant</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type your request..."
          value={input}
          onChangeText={setInput}
        />
        
        {/* Voice Input Button */}
        <TouchableOpacity 
          style={[styles.voiceButton, isRecording && styles.recordingButton]} 
          onPress={isRecording ? stopRecording : startRecording}
        >
          <Text style={styles.buttonText}>
            {isRecording ? '■' : '🎤'}
          </Text>
        </TouchableOpacity>
        
        {/* Send Button */}
        <TouchableOpacity 
          style={styles.sendButton} 
          onPress={handleDetectIntent}
        >
          <Text style={styles.buttonText}>➤</Text>
        </TouchableOpacity>
      </View>
      
      {/* Show Loading Indicator */}
      {loading && <ActivityIndicator size="large" color="#4285F4" style={{ marginTop: 10 }} />}
      
      {/* Display Detected Intent */}
      {intent && !loading && (
        <View style={styles.resultContainer}>
          <Text style={styles.intentText}>Intent: {intent}</Text>
        </View>
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center", 
    backgroundColor: "#F5F5F5", 
    padding: 20 
  },
  title: { 
    fontSize: 24, 
    fontWeight: "bold", 
    marginBottom: 20 
  },
  inputContainer: { 
    flexDirection: "row", 
    alignItems: "center", 
    width: "100%", 
    backgroundColor: "white", 
    borderRadius: 10, 
    padding: 10, 
    elevation: 3 
  },
  input: { 
    flex: 1, 
    fontSize: 16 
  },
  voiceButton: { 
    marginLeft: 10, 
    backgroundColor: "#34A853", 
    padding: 10, 
    borderRadius: 50,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center"
  },
  recordingButton: {
    backgroundColor: "#EA4335",
  },
  sendButton: { 
    marginLeft: 10, 
    backgroundColor: "#4285F4", 
    padding: 10, 
    borderRadius: 50,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center"
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    textAlign: "center",
  },
  resultContainer: { 
    marginTop: 20, 
    padding: 15, 
    backgroundColor: "white", 
    borderRadius: 10, 
    elevation: 3 
  },
  intentText: { 
    fontSize: 18, 
    fontWeight: "600", 
    color: "#333" 
  },
});

export default AssistantsScreen;