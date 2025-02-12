import * as SplashScreen from "expo-splash-screen"
import * as React from "react"
import { Navigation } from "./navigation"
import { GestureHandlerRootView } from "react-native-gesture-handler"

SplashScreen.preventAutoHideAsync()

export function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Navigation
        linking={{
          enabled: "auto",
          prefixes: [
            // Change the scheme to match your app's scheme defined in app.json
            "tuneo://",
          ],
        }}
        onReady={() => {
          SplashScreen.hideAsync()
        }}
      />
    </GestureHandlerRootView>
  )
}
