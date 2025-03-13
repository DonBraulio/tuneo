import Colors from "@/colors"
import { MenuAction, MenuView } from "@react-native-menu/menu"
import { ReactNode } from "react"
import { Appearance, Platform } from "react-native"

export const Picker = ({
  actions,
  onSelect,
  value,
  children,
}: {
  actions: MenuAction[]
  onSelect: (id: string) => void
  value: string
  children: ReactNode
}) => {
  // Dark menu depends on phone settings in android
  const theme =
    Platform.OS === "android" && Appearance.getColorScheme() === "light" ? "light" : "dark"
  const titleColor = theme === "light" ? Colors.fgLight : Colors.primary
  return (
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
            subactions: a.subactions?.map((s) => ({
              ...s,
              titleColor,
              state: value === s.id ? "on" : "off",
            })),
          } as MenuAction)
      )}
      themeVariant={theme}
    >
      {children}
    </MenuView>
  )
}
