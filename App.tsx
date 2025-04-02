import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { NavigationContainer } from "@react-navigation/native";
import LoginScreen from "./src/screens/LoginScreen";
import AssistantsScreen from "./src/screens/Assistants";

const Stack = createStackNavigator();

const App: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Assistants" component={AssistantsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
