import { createStaticNavigation } from "@react-navigation/native"
import type { StaticParamList } from "@react-navigation/native"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { Settings } from "./screens/Settings"
import { Tuneo } from "./screens/Tuneo"
import Colors from "@/colors"
import { CloseButton } from "@/components/CloseButton"
import { Platform } from "react-native"

const RootStack = createNativeStackNavigator({
  screens: {
    Tuneo: {
      screen: Tuneo,
      options: {
        headerShown: false,
      },
    },
    Settings: {
      screen: Settings,
      options: () => ({
        headerTitleStyle: { color: Colors.primary },
        headerStyle: { backgroundColor: Colors.bgTitle },
        headerTintColor: Colors.primary,
        headerShadowVisible: false,
        ...(Platform.OS === "ios"
          ? { presentation: "fullScreenModal", headerRight: () => <CloseButton /> }
          : {}),
      }),
    },
  },
})

export const Navigation = createStaticNavigation(RootStack)

type RootStackParamList = StaticParamList<typeof RootStack>

declare global {
  namespace ReactNavigation {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface RootParamList extends RootStackParamList {}
  }
}
