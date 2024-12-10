import { Text } from "@react-navigation/elements"
import { StaticScreenProps } from "@react-navigation/native"
import { StyleSheet, View } from "react-native"
import { MicrophoneStreamView, MicrophoneStreamViewProps } from "@/../modules/microphone-stream"

type Props = StaticScreenProps<{
  user: string
}>

export function Profile({ route }: Props) {
  return (
    <MicrophoneStreamView
      url="https://docs.expo.dev/modules/"
      onLoad={() => {
        console.log("Loaded Micro View!")
      }}
    />
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
