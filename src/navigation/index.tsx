import { HeaderButton, Text } from "@react-navigation/elements"
import { createStaticNavigation, StaticParamList } from "@react-navigation/native"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { Settings } from "./screens/Settings"
import { NotFound } from "./screens/NotFound"
import { Tuneo } from "./screens/Tuneo"

const RootStack = createNativeStackNavigator({
  screens: {
    Tuneo: {
      screen: Tuneo,
      options: {
        title: "",
        headerTransparent: true,
        headerTitle: () => undefined,
      },
    },
    Settings: {
      screen: Settings,
      options: ({ navigation }) => ({
        presentation: "modal",
        headerRight: () => (
          <HeaderButton onPress={navigation.goBack}>
            <Text>Close</Text>
          </HeaderButton>
        ),
      }),
    },
    NotFound: {
      screen: NotFound,
      options: {
        title: "404",
      },
      linking: {
        path: "*",
      },
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
