import { HeaderButton, Text } from "@react-navigation/elements"
import { createStaticNavigation, StaticParamList } from "@react-navigation/native"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { Settings } from "./screens/Settings"
import { Tuneo } from "./screens/Tuneo"
import Colors from "@/colors"

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
      options: ({ navigation }) => ({
        presentation: "modal",
        headerRight: () => (
          <HeaderButton onPress={navigation.goBack}>
            <Text style={{ color: Colors.primary }}>Close</Text>
          </HeaderButton>
        ),
        headerTitleStyle: { color: Colors.primary },
        headerStyle: { backgroundColor: Colors.bgTitle },
        headerShadowVisible: false,
      }),
    },
  },
})

export const Navigation = createStaticNavigation(RootStack)

type RootStackParamList = StaticParamList<typeof RootStack>

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
