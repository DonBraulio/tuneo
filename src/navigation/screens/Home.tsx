import { Button, Text } from "@react-navigation/elements"
import { StyleSheet, View } from "react-native"
import MicrophoneStreamModule from "@/../modules/microphone-stream"

export function Home() {
  return (
    <View style={styles.container}>
      <Text>{MicrophoneStreamModule.hello()}</Text>
      <Button screen="Profile" params={{ user: "jane" }}>
        Go to Profile
      </Button>
      <Button screen="Settings">Go to Settings</Button>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },
})
