import sharp from "sharp"
import { EFormat } from "./common"

export type TOptimProps = {
  width: number | null
  height: number | null
  quality: number | null
  format: EFormat
}
export const streamToSharp = ({ width, height, format, quality }: TOptimProps) => {
  return format
    ? sharp()
        .resize(width, height)
        .toFormat(format, { quality: quality ? quality : 85 })
    : sharp().resize(width, height)
}

type TNewKeyProps = TOptimProps & { key: string }
export const createFileKey = ({ width, height, format, key, quality }: TNewKeyProps) => {
  let result = ""
  if (format) {
    result += `f_${format}`
  }
  if (width) {
    if (result) {
      result += "-"
    }
    result += `w_${width}`
  }
  if (height) {
    if (result) {
      result += "-"
    }
    result += `h_${height}`
  }
  if (quality) {
    if (result) {
      result += "-"
    }
    result += `q_${quality}`
  }

  return `${result}/${key}`
}
