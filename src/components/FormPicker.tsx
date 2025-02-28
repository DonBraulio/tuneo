import Colors from "@/colors"
import { MenuAction, MenuView } from "@react-native-menu/menu"
import { Appearance, Platform, StyleSheet, Text, View } from "react-native"

export const FormPicker = ({
  label,
  actions,
  onSelect,
  value,
}: {
  label: string
  actions: MenuAction[]
  onSelect: (id: string) => void
  value: string
}) => {
  // Dark menu depends on phone settings in android
  const theme =
    Platform.OS === "android" && Appearance.getColorScheme() === "light" ? "light" : "dark"
  const titleColor = theme === "light" ? Colors.fgLight : Colors.primary
  return (
    <View style={styles.pickerRow}>
      <Text style={styles.pickerLabel}>{label}</Text>
      <MenuView
        onPressAction={async ({ nativeEvent }) => {
          const id = nativeEvent.event
          onSelect(id)
        }}
        actions={actions.map(
          (a) =>
            ({
              ...a,
              state: value === a.id ? "on" : "off",
              titleColor,
            } as MenuAction)
        )}
        themeVariant={theme}
      >
        <Text style={styles.pickerText}>
          {actions.find((l) => l.id === value)?.title ?? "Select..."}
        </Text>
      </MenuView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.bgInactive,
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "flex-start",
    gap: 10,
  },
  pickerText: {
    color: Colors.primary,
    fontSize: 16,
    backgroundColor: Colors.bgActive,
    padding: 8,
    borderRadius: 8,
    minWidth: 100,
    textAlign: "center",
    fontWeight: "500",
  },
  pickerLabel: { color: Colors.primary, fontSize: 16, flex: 1 },
  pickerRow: { flexDirection: "row", alignItems: "center" },
})
