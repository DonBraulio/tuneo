import Colors from "@/colors"
import { useTranslation } from "@/translations"
import { HeaderButton } from "@react-navigation/elements"
import { useNavigation } from "@react-navigation/native"
import { Text } from "react-native"

export const CloseButton = () => {
  const navigation = useNavigation()
  const t = useTranslation()
  return (
    <HeaderButton onPress={navigation.goBack}>
      <Text style={{ color: Colors.primary }}>{t("close")}</Text>
    </HeaderButton>
  )
}
