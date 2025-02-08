const combineColorTuples = (c1: number[], c2: number[], ratio: number) => {
  return c1.map((_, i) => (1 - ratio) * c1[i] + ratio * c2[i])
}

const getColorFromPitchDeviation = (pitchDeviation: number) => {
  const [colorR, colorG, colorB] = combineColorTuples(
    Colors.centerTuple,
    pitchDeviation > 0 ? Colors.highTuple : Colors.lowTuple,
    Math.abs(pitchDeviation) ** 0.3
  )
  return `rgb(${colorR}, ${colorG}, ${colorB})`
}

const Colors = {
  bgInactive: "#222222",
  bgActive: "#333333",
  bgTitle: "#222222",
  secondary: "#7a7a7a",
  primary: "#ffffff",

  // tuner indicators
  low: "rgb(255, 60, 0)",
  high: "rgb(255, 60, 0)",
  center: "rgb(120, 255, 0)",
  lowTuple: [255, 60, 0],
  highTuple: [255, 60, 0],
  centerTuple: [120, 255, 0],

  combineColorTuples,
  getColorFromPitchDeviation,
}

export default Colors
