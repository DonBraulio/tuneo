import React from "react"
import { Pressable } from "react-native-gesture-handler"
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated"
import Colors from "@/Colors"
import { Ionicons } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"

const ConfigButton = ({ x, y }: { x: number; y: number }) => {
  const rotation = useSharedValue(0)
  const navigation = useNavigation()

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
    backgroundColor: `#ffffff55`,
    padding: 5,
    borderRadius: 50,
  }))

  const handlePress = () => {
    rotation.value = withTiming(rotation.value + 180, { duration: 400 })
    setTimeout(() => {
      navigation.navigate("Settings")
    }, 150)
  }

  return (
    <Pressable
      onPressIn={handlePress}
      style={{ position: "absolute", left: x, top: y, zIndex: 10 }}
    >
      <Animated.View style={animatedStyle}>
        <Ionicons name="settings-outline" size={28} color={Colors.primary} />
      </Animated.View>
    </Pressable>
  )
}

export default ConfigButton
