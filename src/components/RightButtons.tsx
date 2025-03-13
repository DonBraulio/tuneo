import Colors from "@/colors"
import { Instrument } from "@/instruments"
import { getTuningFreq, InstrumentType, TuningType, useConfigStore } from "@/stores/configStore"
import { Feather, FontAwesome5, Ionicons } from "@expo/vector-icons"
import { Linking, Platform, Pressable, Text, useWindowDimensions, View } from "react-native"
import { Picker } from "./Picker"
import { MenuAction } from "@react-native-menu/menu"
import { useMemo } from "react"
import { useTranslation } from "@/configHooks"

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
  const setTuning = useConfigStore((state) => state.setTuning)
  const tuning = useConfigStore((state) => state.tuning)
  const t = useTranslation()
  const btnW = width / 7
  const fontHeight = height / 70
  const fontSize = fontHeight / 1.3
  const btnBorder = 1
  const btnSpacing = 10

  const instruments: MenuAction[] = useMemo(() => {
    const subactions = [
      {
        id: "chromatic", // Must be InstrumentType
        title: t("chromatic"),
        displayInline: true,
      },
      {
        id: "guitar", // Must be InstrumentType,
        title: t("guitar"),
        displayInline: true,
      },
    ]
    // Avoid nested menus in android (collapsed by default)
    return Platform.OS === "android"
      ? subactions
      : [
          {
            id: "instrument",
            title: t("mode"),
            displayInline: true,
            subactions,
          },
        ]
  }, [t])

  const tunings: MenuAction[] = useMemo(() => {
    const subactions = [
      {
        id: "ref_440" as TuningType, // NOTE: not typechecked
        title: t("tuning_440"),
        displayInline: true,
      },
      {
        id: "ref_432" as TuningType, // NOTE: not typechecked
        title: t("tuning_432"),
        displayInline: true,
      },
      {
        id: "ref_444" as TuningType, // NOTE: not typechecked
        title: t("tuning_444"),
        displayInline: true,
      },
    ]
    // Avoid nested menus in android (collapsed by default)
    return Platform.OS === "android"
      ? subactions
      : [
          {
            id: "tuning-type",
            title: t("reference_a4"),
            displayInline: true,
            subactions,
          },
        ]
  }, [t])

  return (
    <View
      style={{
        position: "absolute",
        top: positionY + 10,
        right: btnSpacing,
        gap: btnSpacing,
      }}
    >
      <Picker
        actions={instruments}
        onSelect={(value) => setInstrument(value as InstrumentType)}
        value={instrument.name}
      >
        <View
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
        </View>
      </Picker>
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
            {t("gtr_string")}
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
      <Picker actions={tunings} onSelect={(value) => setTuning(value as TuningType)} value={tuning}>
        <View
          style={{
            marginLeft: btnSpacing,
            width: btnW,
            borderRadius: 10,
            backgroundColor: Colors.bgActive,
            borderColor: Colors.secondary,
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
            {t("reference")}
          </Text>
          <Text
            style={{
              color: tuning === "ref_440" ? Colors.ok : Colors.warn,
              fontSize: fontSize,
              textAlign: "center",
              fontWeight: "600",
            }}
          >
            {getTuningFreq(tuning)}Hz
          </Text>
        </View>
      </Picker>

      <Pressable
        onPress={async () => {
          await Linking.openURL(`https://www.instagram.com/tuneo.app/`)
        }}
        style={{
          marginLeft: btnSpacing,
          width: btnW,
          borderRadius: 10,
          backgroundColor: Colors.bgActive,
          borderColor: Colors.secondary,
          borderWidth: btnBorder,
          justifyContent: "center",
          alignItems: "center",
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
          {t("feedback")}
        </Text>
        <Feather name="heart" size={fontHeight} color={Colors.primary} />
      </Pressable>
    </View>
  )
}
