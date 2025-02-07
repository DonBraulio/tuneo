import Colors from "@/Colors"
import { MenuAction, MenuComponentRef, MenuView } from "@react-native-menu/menu"
import { useRef, useState } from "react"
import { StyleSheet, Text, View } from "react-native"

export const FormPicker = ({
  label,
  actions,
  onSelect,
  defaultId,
}: {
  label: string
  actions: MenuAction[]
  onSelect: (id: string) => void
  defaultId: string
}) => {
  const [action, setAction] = useState(defaultId)

  return (
    <View style={styles.pickerRow}>
      <Text style={styles.pickerLabel}>{label}</Text>
      <MenuView
        onPressAction={async ({ nativeEvent }) => {
          const id = nativeEvent.event
          setAction(id)
          onSelect(id)
        }}
        actions={actions.map(
          (a) =>
            ({
              ...a,
              state: action === a.id ? "on" : "off",
            } as MenuAction)
        )}
      >
        <Text style={styles.pickerText}>
          {actions.find((l) => l.id === action)?.title ?? "Select..."}
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
