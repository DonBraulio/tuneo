import Colors from "@/colors"
import { useTranslation } from "@/configHooks"
import React from "react"
import { View, Text, StyleSheet, TouchableOpacity, Linking, Platform } from "react-native"

const RequireMicAccess = () => {
  const t = useTranslation()

  const openAppSettings = () => {
    if (Platform.OS === "ios") {
      Linking.openURL("app-settings:") // Opens iOS settings for the app
    } else {
      Linking.openSettings() // Opens Android settings for the app
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.errorText}>🎸 {t("error_mic_access")}</Text>
      <TouchableOpacity style={styles.button} onPress={openAppSettings}>
        <Text style={styles.buttonText}>{t("configure_permissions")}</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    backgroundColor: Colors.bgInactive,
  },
  errorText: {
    fontSize: 18,
    color: Colors.secondary,
    textAlign: "center",
    marginBottom: 20,
  },
  button: {
    backgroundColor: Colors.bgActive,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  buttonText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: "bold",
  },
})

export default RequireMicAccess
