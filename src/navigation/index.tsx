import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { HeaderButton, Text } from "@react-navigation/elements"
import { createStaticNavigation, StaticParamList } from "@react-navigation/native"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { Image } from "react-native"
import bell from "../assets/bell.png"
import newspaper from "../assets/newspaper.png"
import { Home } from "./screens/Home"
import { Settings } from "./screens/Settings"
import { Updates } from "./screens/Updates"
import { NotFound } from "./screens/NotFound"
import { Tuneo } from "./screens/Tuneo"
import { Foundation } from "@expo/vector-icons"
import Colors from "@/Colors"

const HomeTabs = createBottomTabNavigator({
  screenOptions: {
    tabBarInactiveBackgroundColor: Colors.bgInactive,
    tabBarActiveBackgroundColor: Colors.bgActive,
    tabBarAllowFontScaling: false,
    tabBarStyle: { borderTopWidth: 0, elevation: 0, paddingBottom: 0 },
  },
  screens: {
    Tuneo: {
      screen: Tuneo,
      options: {
        title: "Tuner",
        tabBarIcon: ({ color, size }) => <Foundation name="sound" size={size} color={color} />,
        headerTransparent: true,
        headerTitle: () => undefined,
      },
    },
    Home: {
      screen: Home,
      options: {
        title: "Feed",
        tabBarIcon: ({ color, size }) => (
          <Image
            source={newspaper}
            tintColor={color}
            style={{
              width: size,
              height: size,
            }}
          />
        ),
      },
    },
    Updates: {
      screen: Updates,
      options: {
        tabBarIcon: ({ color, size }) => (
          <Image
            source={bell}
            tintColor={color}
            style={{
              width: size,
              height: size,
            }}
          />
        ),
      },
    },
  },
})

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
    // TODO: REMOVE OR CHANGE
    HomeTabs: {
      screen: HomeTabs,
      options: {
        title: "Home",
        headerShown: false,
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
