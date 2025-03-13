import Colors from "@/colors"
import { MenuAction } from "@react-native-menu/menu"
import { StyleSheet, Text, View } from "react-native"
import { Picker } from "./Picker"

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
  return (
    <View style={styles.pickerRow}>
      <Text style={styles.pickerLabel}>{label}</Text>
      <Picker onSelect={onSelect} value={value} actions={actions}>
        <Text style={styles.pickerText}>
          {actions.find((l) => l.id === value)?.title ?? "Select..."}
        </Text>
      </Picker>
    </View>
  )
}

const styles = StyleSheet.create({
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
