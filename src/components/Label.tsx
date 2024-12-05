import { useFont, Text } from "@shopify/react-native-skia"
import React from "react"
import type { SharedValue } from "react-native-reanimated"
import { interpolate, useDerivedValue } from "react-native-reanimated"

import { PADDING } from "../Model"

const sfMono = require("@/assets/SF-Mono-Medium.otf")

interface LabelProps {
  text: string
  width: number
  height: number
}

export const Label = ({ text, width, height }: LabelProps) => {
  const titleFont = useFont(sfMono, 64)
  const translateY = height + PADDING

  const titleX = useDerivedValue(() => {
    if (!titleFont) return 0
    const titleWidth = titleFont.getTextWidth(text)
    return width / 2 - titleWidth / 2
  }, [titleFont])

  return (
    <>
      <Text x={titleX} y={translateY - 120} text={text} font={titleFont} color="white" />
    </>
  )
}
