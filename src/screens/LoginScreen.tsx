import React, { useState, useEffect } from "react";
import { View, Image, StyleSheet, StatusBar, SafeAreaView } from "react-native";
import { Button, Text, Snackbar } from "react-native-paper";
import EncryptedStorage from "react-native-encrypted-storage";
import { signInWithGoogle } from "../utils/GoogleAuth";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";

const LoginScreen: React.FC = () => {
  const [message, setMessage] = useState<string | null>(null);
  const navigation = useNavigation();
    
  useEffect(() => {
    const checkToken = async () => {
      const storedToken = await EncryptedStorage.getItem("user_token");
      if (storedToken) {
        navigation.navigate("Assistants");
      }
    };
    checkToken();
  }, []);

  const handleSignIn = async () => {
    const result = await signInWithGoogle();
    if (result && result.accessToken) {
      await EncryptedStorage.setItem("user_token", result.accessToken);
      setMessage("✅ Signed in successfully!");
      navigation.navigate("Assistants");
    } else {
      setMessage("❌ Sign-in Failed!");
    }
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.container}>
          <Text style={styles.title}>Welcome to Virtual Assistant</Text>
          <Image source={{ uri: "https://cdn-icons-png.flaticon.com/512/3003/3003035.png" }} style={styles.image} />
          <Button mode="contained" onPress={handleSignIn} style={styles.button} icon={({ size }) => (
            <Image source={{ uri: "https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" }} style={{ width: size, height: size }} />
          )}>
            Sign in with Google
          </Button>
          <Snackbar visible={!!message} onDismiss={() => setMessage(null)}>{message}</Snackbar>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F5F5F5" },
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 20 },
  image: { width: 150, height: 150, marginBottom: 20 },
  button: { marginTop: 10, width: "80%", backgroundColor: "#4285F4" },
});

export default LoginScreen;
