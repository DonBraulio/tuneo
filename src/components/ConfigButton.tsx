import React from "react"
import { Pressable } from "react-native-gesture-handler"
import Animated, { useAnimatedStyle, useSharedValue, withDecay } from "react-native-reanimated"
import Colors from "@/Colors"
import { Ionicons } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"
import { MenuView } from "@react-native-menu/menu"
import { View } from "react-native"
import { useConfigStore } from "@/Config"

const ConfigButton = ({ x, y, size = 1 }: { x: number; y: number; size: number }) => {
  const rotation = useSharedValue(0)
  const navigation = useNavigation()
  const config = useConfigStore()

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
    backgroundColor: `#ffffff55`,
    padding: 5 * size,
    borderRadius: 50 * size,
  }))

  const spinWheel = () => {
    rotation.value = withDecay({ velocity: 360 })
  }

  return (
    <View style={{ position: "absolute", left: x, top: y }}>
      {/* Workaround, onOpenMenu handler doesn't work */}
      <Pressable onPressIn={spinWheel}>
        <MenuView
          themeVariant="dark"
          onPressAction={({ nativeEvent }) => {
            const action = nativeEvent.event
            if (action === "settings") {
              navigation.navigate("Settings")
            } else if (action === "instr-any") {
              config.setInstrument("any")
            } else {
              config.setInstrument("guitar")
            }
          }}
          actions={[
            { id: "settings", title: "More settings..." },
            {
              id: "instrument",
              title: "Instrument",
              displayInline: true,
              subactions: [
                {
                  id: "instr-any",
                  title: "Any instrument",
                  state: config.instrument === "any" ? "on" : "off",
                },
                {
                  id: "instr-gtr",
                  title: "Guitar",
                  state: config.instrument === "guitar" ? "on" : "off",
                },
              ],
            },
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
