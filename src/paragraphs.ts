import { Skia, TextAlign, useFonts } from "@shopify/react-native-skia"
import { useCallback } from "react"

export const useParagraphBuilder = () => {
  const fonts = useFonts({
    Roboto: [
      require("@/../assets/Roboto-Regular.ttf"),
      require("@/../assets/Roboto-Medium.ttf"),
      require("@/../assets/Roboto-Bold.ttf"),
      require("@/../assets/Roboto-Italic.ttf"),
    ],
  })

  const centered = useCallback(
    (text: string, size: number, weight: number, color: string) => {
      if (!fonts) return null

      const textStyle = {
        fontFamilies: ["Roboto"],
        fontSize: size,
        fontStyle: { weight },
        color: Skia.Color(color),
      }
      return Skia.ParagraphBuilder.Make({ textAlign: TextAlign.Center }, fonts)
        .pushStyle(textStyle)
        .addText(text)
        .pop()
        .build()
    },
    [fonts]
  )

  return { centered }
}
