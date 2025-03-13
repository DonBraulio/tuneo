import Colors from "@/colors"
import { Instrument } from "@/instruments"
import { useConfigStore } from "@/stores/configStore"
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
  const btnH = height / 30
  const btnW = width / 7
  const fontHeight = btnH / 2.2
  const fontSize = fontHeight / 1.3
  const btnBorder = 1
  const btnSpacing = 10

  return (
    <View
      style={{
        position: "absolute",
        top: positionY + btnSpacing,
        right: btnSpacing,
        gap: btnSpacing,
      }}
    >
      <Pressable
        onPress={() => setManual(!manual)}
        style={{
          marginLeft: btnSpacing,
          height: btnH - 2 * btnBorder,
          width: btnW,
          borderRadius: 10,
          backgroundColor: manual ? Colors.bgActive : Colors.secondary,
          borderColor: manual ? Colors.secondary : Colors.accent,
          borderWidth: btnBorder,
          justifyContent: "center",
        }}
      >
        <Text
          style={{
            color: Colors.primary,
            fontSize: fontSize,
            textAlign: "center",
          }}
        >
          {manual ? "MANUAL" : "AUTO"}
        </Text>
      </Pressable>
    </View>
  )
}
