import { GoogleSignin, statusCodes } from "@react-native-google-signin/google-signin";

GoogleSignin.configure({
  webClientId: "678808392040-lhj4ll9se16jrq6654ktueg97n4bd4uq.apps.googleusercontent.com", // Replace with actual ID
  offlineAccess: true,
  scopes: ["profile", "email"], // Add required scopes
});

export const signInWithGoogle = async () => {
  try {
    await GoogleSignin.hasPlayServices();
    const userInfo = await GoogleSignin.signIn();
    
    // Fetch tokens only if sign-in is successful
    const tokens = await GoogleSignin.getTokens();
    
    console.log("Access Token:", tokens.accessToken); // Log to verify

    return {
      user: userInfo.user,
      accessToken: tokens.accessToken,
    };
  } catch (error: any) {
    if (error.code === statusCodes.SIGN_IN_CANCELLED) {
      console.error("Sign-in was cancelled.");
    } else {
      console.error("Google Sign-In Error:", error);
    }
    return null;
  }
};

export const signOutFromGoogle = async () => {
  try {
    await GoogleSignin.signOut();
    return true;
  } catch (error) {
    console.error("Google Sign-Out Error:", error);
    return false;
  }
};
