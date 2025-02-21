import React, { useCallback, useMemo } from "react"
import { Pressable } from "react-native-gesture-handler"
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated"
import Colors from "@/colors"
import { Ionicons } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"
import { MenuAction, MenuView } from "@react-native-menu/menu"
import { Appearance, Platform, View } from "react-native"
import { useConfigStore } from "@/configHooks"
import { useTranslation } from "@/configHooks"

const ConfigButton = ({ x, y, size = 1 }: { x: number; y: number; size: number }) => {
  const rotation = useSharedValue(0)
  const navigation = useNavigation()
  const instrument = useConfigStore((state) => state.instrument)
  const setInstrument = useConfigStore((state) => state.setInstrument)
  const t = useTranslation()

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
    backgroundColor: `#ffffff55`,
    padding: 5 * size,
    borderRadius: 50 * size,
  }))

  const spinWheel = useCallback(() => {
    rotation.value = withTiming(rotation.value + 90, { duration: 400 })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Dark menu depends on phone settings in android
  const theme = useMemo(
    () => (Platform.OS === "android" && Appearance.getColorScheme() === "light" ? "light" : "dark"),
    []
  )

  const configActions = useMemo(() => {
    // Themes work inconsistently across android versions
    const titleColor = theme === "light" ? Colors.fgLight : Colors.primary

    const actions: MenuAction[] = [
      {
        id: "instrument",
        title: t("instrument"),
        displayInline: true,
        titleColor,

        subactions: [
          {
            id: "instr-chromatic",
            title: t("chromatic"),
            state: instrument === "chromatic" ? "on" : "off",
            displayInline: true,
            titleColor,
          },
          {
            id: "instr-gtr",
            title: t("guitar"),
            state: instrument === "guitar" ? "on" : "off",
            displayInline: true,
            titleColor,
          },
        ],
      },
      { id: "settings", title: t("more_settings"), titleColor },
    ]
    if (Platform.OS === "ios") {
      actions.reverse()
    }
    return actions
  }, [instrument, t, theme])

  return (
    <View style={{ position: "absolute", left: x, top: y }}>
      {/* Workaround, onOpenMenu handler doesn't work */}
      <Pressable onPressIn={spinWheel}>
        <MenuView
          themeVariant={theme}
          isAnchoredToRight={true}
          onPressAction={({ nativeEvent }) => {
            const action = nativeEvent.event
            if (action === "settings") {
              navigation.navigate("Settings")
            } else if (action === "instr-chromatic") {
              setInstrument("chromatic")
            } else {
              setInstrument("guitar")
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
