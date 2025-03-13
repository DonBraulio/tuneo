import Colors from "@/colors"
import { Instrument } from "@/instruments"
import { useConfigStore } from "@/stores/configStore"
import { FontAwesome5, Ionicons } from "@expo/vector-icons"
import { Pressable, Text, useWindowDimensions, View } from "react-native"

export const RightButtons = ({
  positionY,
  instrument,
}: {
  positionY: number
  instrument: Instrument
}) => {
  const { height, width } = useWindowDimensions()
  const manual = useConfigStore((state) => state.manual)
  const setManual = useConfigStore((state) => state.setManual)
  const setInstrument = useConfigStore((state) => state.setInstrument)
  const btnW = width / 7
  const fontHeight = height / 70
  const fontSize = fontHeight / 1.3
  const btnBorder = 1
  const btnSpacing = 10

  return (
    <View
      style={{
        position: "absolute",
        top: positionY + 10,
        right: btnSpacing,
        gap: btnSpacing,
      }}
    >
      <Pressable
        onPress={() => {}}
        style={{
          marginLeft: btnSpacing,
          width: btnW,
          height: btnW,
          borderRadius: 10,
          backgroundColor: Colors.bgActive,
          borderColor: Colors.secondary,
          borderWidth: btnBorder,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {instrument.name === "guitar" && (
          <FontAwesome5 color={Colors.primary} size={2 * fontHeight} name="guitar" />
        )}
        {instrument.name === "chromatic" && (
          <Ionicons color={Colors.primary} size={2 * fontHeight} name="musical-note" />
        )}
      </Pressable>
      {instrument.hasStrings && (
        <Pressable
          onPress={() => setManual(!manual)}
          style={{
            marginLeft: btnSpacing,
            width: btnW,
            borderRadius: 10,
            backgroundColor: manual ? Colors.bgActive : Colors.secondary,
            borderColor: manual ? Colors.secondary : Colors.accent,
            borderWidth: btnBorder,
            justifyContent: "center",
            paddingVertical: 10,
            gap: 3,
          }}
        >
          <Text
            style={{
              color: Colors.primary,
              fontSize: fontSize * 0.8,
              textAlign: "center",
            }}
          >
            STRING
          </Text>
          <Text
            style={{
              color: manual ? Colors.warn : Colors.ok,
              fontSize: fontSize,
              textAlign: "center",
              fontWeight: "600",
            }}
          >
            {manual ? "MANUAL" : "AUTO"}
          </Text>
        </Pressable>
      )}
    </View>
  )
}
