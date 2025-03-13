import React from "react"
import { Pressable } from "react-native-gesture-handler"
import Colors from "@/colors"
import { Ionicons } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"
import { View } from "react-native"

const ConfigButton = ({ x, y, size = 1 }: { x: number; y: number; size: number }) => {
  const navigation = useNavigation()

  return (
    <View
      style={{
        position: "absolute",
        left: x,
        top: y,
        backgroundColor: "#ffffff55",
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 50 * size,
        padding: 5 * size,
      }}
    >
      <Pressable
        onPressIn={() => {
          navigation.navigate("Settings")
        }}
      >
        <Ionicons name="settings-outline" size={28 * size} color={Colors.primary} />
      </Pressable>
    </View>
  )
}

export default ConfigButton
