import { Dimensions, PixelRatio } from 'react-native'

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window')

// Guideline sizes are based on standard ~iPhone 11/12/13 dimensions
const guidelineBaseWidth = 390
const guidelineBaseHeight = 844

export const scale = (size: number) => (SCREEN_WIDTH / guidelineBaseWidth) * size
export const verticalScale = (size: number) => (SCREEN_HEIGHT / guidelineBaseHeight) * size
export const moderateScale = (size: number, factor = 0.5) =>
  size + (scale(size) - size) * factor

export const normalizeFont = (size: number) => {
  const newSize = scale(size)
  return Math.round(PixelRatio.roundToNearestPixel(newSize))
}

export default { scale, verticalScale, moderateScale, normalizeFont }
