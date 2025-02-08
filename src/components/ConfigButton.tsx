import React from "react"
import { Pressable } from "react-native-gesture-handler"
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDecay,
  withTiming,
} from "react-native-reanimated"
import Colors from "@/Colors"
import { Ionicons } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"
import { MenuView } from "@react-native-menu/menu"
import { View } from "react-native"

const ConfigButton = ({ x, y, size = 1 }: { x: number; y: number; size: number }) => {
  const rotation = useSharedValue(0)
  const navigation = useNavigation()

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
    backgroundColor: `#ffffff55`,
    padding: 5 * size,
    borderRadius: 50 * size,
  }))

  const spinWheel = () => {
    rotation.value = withDecay({ velocity: 360 })
    // setTimeout(() => {
    //   navigation.navigate("Settings")
    // }, 150)
  }

  return (
    <View style={{ position: "absolute", left: x, top: y }}>
      {/* Workaround, onOpenMenu handler doesn't work */}
      <Pressable onPressIn={spinWheel}>
        <MenuView
          themeVariant="dark"
          actions={[
            { id: "settings", title: "More settings..." },
            { id: "instr-free", title: "Free notes" },
            { id: "instr-gtr", title: "Guitar" },
          ]}
        >
          <Animated.View style={animatedStyle}>
            <Ionicons name="settings-outline" size={28 * size} color={Colors.primary} />
          </Animated.View>
        </MenuView>
      </Pressable>
    </View>
  )
}

export default ConfigButton
