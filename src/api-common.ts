export type TEnv = {
  API_GATEWAY_URL: string
  FORMATED_IMG_URL_PREFIX: string
  ORIGIN_IMG_URL_PREFIX: string
}

type TImgProps = {
  format: string | null
  width: number | null
  height: number | null
  quality: number | null
  key: string
  oldKey: string
}

const predicates = ["f_", "w_", "h_", "q_"]

export const trimParam = (predicate: string, param: string | undefined): string | null => {
  return param ? param.replace(predicate, "") : null
}

export const parsePath = (image_pathname: string): TImgProps => {
  const path_arr = image_pathname.slice(1).split("/")
  const params_arr = path_arr[0].split("-")
  const [format, width, height, quality] = predicates.map(predicate => {
    return trimParam(
      predicate,
      params_arr.find(p => p.startsWith(predicate))
    )
  })
  const oldKey = path_arr.slice(1).join("/")
  const key = changeExt(oldKey, format)
  return {
    format,
    width: width ? Number(width) : null,
    height: height ? Number(height) : null,
    quality: quality ? Number(quality) : null,
    key,
    oldKey,
  }
}

export const changeExt = (keyName: string, newExt: string | null): string => {
  const keyArr = keyName.split(".")
  if (newExt) {
    if (keyArr.length > 1) {
      keyArr[keyArr.length - 1] = newExt
    } else keyArr.push(newExt)
  }
  return keyArr.join(".")
}

export const createSarchParams = (params: TImgProps, image_src: string): string => {
  const { format, width, height, key, quality } = params
  return `${format ? "format=" + format + "&" : ""}${width ? "width=" + width + "&" : ""}${
    height ? "height=" + height + "&" : ""
  }${quality ? "quality=" + quality + "&" : ""}key=${key}${
    image_src ? "&image_src=" + image_src : ""
  }`
}

export const isAllowedQuality = (quality: number): boolean => quality > 0 && quality <= 100

export const arePropsAllowed = (img_props: TImgProps, widths: number[], heights: number[]) => {
  return (
    (img_props.width && !widths.includes(img_props.width)) ||
    (img_props.height && !heights.includes(img_props.height)) ||
    (img_props.quality && !isAllowedQuality(img_props.quality))
  )
}
