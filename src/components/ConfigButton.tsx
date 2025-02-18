import React from "react"
import { Pressable } from "react-native-gesture-handler"
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated"
import Colors from "@/colors"
import { Ionicons } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"
import { MenuAction, MenuView } from "@react-native-menu/menu"
import { Platform, View } from "react-native"
import { useConfigStore } from "@/config"
import { useTranslation } from "@/translations"

const ConfigButton = ({ x, y, size = 1 }: { x: number; y: number; size: number }) => {
  const rotation = useSharedValue(0)
  const navigation = useNavigation()
  const config = useConfigStore()
  const t = useTranslation()

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
    backgroundColor: `#ffffff55`,
    padding: 5 * size,
    borderRadius: 50 * size,
  }))

  const spinWheel = () => {
    rotation.value = withTiming(rotation.value + 90, { duration: 400 })
  }

  const configActions: MenuAction[] = [
    {
      id: "instrument",
      title: t("instrument"),
      displayInline: true,
      subactions: [
        {
          id: "instr-chromatic",
          title: t("chromatic"),
          state: config.instrument === "chromatic" ? "on" : "off",
          displayInline: true,
        },
        {
          id: "instr-gtr",
          title: t("guitar"),
          state: config.instrument === "guitar" ? "on" : "off",
          displayInline: true,
        },
      ],
    },
    { id: "settings", title: t("more_settings") },
  ]
  if (Platform.OS === "ios") {
    configActions.reverse()
  }

  return (
    <View style={{ position: "absolute", left: x, top: y }}>
      {/* Workaround, onOpenMenu handler doesn't work */}
      <Pressable onPressIn={spinWheel}>
        <MenuView
          themeVariant="dark"
          isAnchoredToRight={true}
          onPressAction={({ nativeEvent }) => {
            const action = nativeEvent.event
            if (action === "settings") {
              navigation.navigate("Settings")
            } else if (action === "instr-chromatic") {
              config.setInstrument("chromatic")
            } else {
              config.setInstrument("guitar")
            }
          }}
          actions={configActions}
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
