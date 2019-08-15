interface ExtendableEvent extends Event {
  waitUntil(f: any): void
}
interface FetchEvent extends ExtendableEvent {
  readonly clientId: string
  readonly preloadResponse: Promise<any>
  readonly request: Request
  readonly resultingClientId: string
  readonly targetClientId: string
  respondWith(r: Response | Promise<Response>): void
}
type TKvStore = {
  get: (key: string) => Promise<string | any | null>
  put: (key: string, value: string, expiration?: { expirationTtl: number }) => Promise<void>
  delete: (key: string) => Promise<void>
}

const KV_STORE = (global as any).IMG_PROXY_ENV as TKvStore

class KvEnvStore {
  private cache: TWorkerCtxEnv | null = null
  async getEnv() {
    if (!this.cache) {
      const env = (await KV_STORE.get("WORKER_ENV")) || "{}"
      this.cache = JSON.parse(env) as TWorkerCtxEnv
    }
    return this.cache
  }
}
const kvEnvStore = new KvEnvStore()

type TWorkerCtxEnv = {
  API_GATEWAY_URL: string
  FORMATED_IMG_URL_PREFIX: string
  ORIGIN_IMG_URL_PREFIX: string
}

const handle = async (event: FetchEvent) => {
  const env: TWorkerCtxEnv = await kvEnvStore.getEnv()
  const url = new URL(event.request.url)
  if (url.pathname.startsWith("/example")) {
    return new Response(getExample(), { headers: { "content-type": "text/html" } })
  }
  const img_props = parsePath(url.pathname.slice(1))
  const formated_target_url =
    env.FORMATED_IMG_URL_PREFIX + changeExt(url.pathname, img_props.format)
  const cache: Cache = (caches as any).default
  const cahed_responce = await cache.match(formated_target_url)
  if (cahed_responce) {
    return cahed_responce
  }
  let origin_response = await fetch(formated_target_url)
  if (!origin_response.ok) {
    const image_src =
      url.searchParams.get("image_src") || `${env.ORIGIN_IMG_URL_PREFIX}/${img_props.oldKey}`
    const gateWayUrl = env.API_GATEWAY_URL + "?" + createSarchParams(img_props, image_src)
    origin_response = await fetch(gateWayUrl)
  }
  const headers = new Headers(origin_response.headers)
  const responce_clone = new Response(origin_response.clone().body, {
    headers,
  })
  headers.delete("set-cookie")
  headers.set("Cache-Control", "max-age=31536000")
  event.waitUntil(cache.put(formated_target_url, responce_clone.clone()))
  return responce_clone
}

const trimParam = (predicate: string, param: string | undefined): string | null => {
  return param ? param.replace(predicate, "") : null
}
const predicates = ["f_", "w_", "h_"]

type TImgProps = {
  format: string | null
  width: number | null
  height: number | null
  key: string
  oldKey: string
}

const parsePath = (image_pathname: string): TImgProps => {
  const path_arr = image_pathname.split("/")
  const params_arr = path_arr[0].split("-")
  const [format, width, height] = predicates.map(predicate => {
    return trimParam(predicate, params_arr.find(p => p.startsWith(predicate)))
  })
  const oldKey = path_arr.slice(1).join("/")
  const key = changeExt(oldKey, format)
  return {
    format,
    width: Number(width),
    height: Number(height),
    key,
    oldKey,
  }
}

const changeExt = (keyName: string, newExt: string | null): string => {
  const keyArr = keyName.split(".")
  if (newExt) {
    if (keyArr.length > 1) {
      keyArr[keyArr.length - 1] = newExt
    } else keyArr.push(newExt)
  }
  return keyArr.join(".")
}

const createSarchParams = (params: TImgProps, image_src: string): string => {
  const { format, width, height, key } = params
  return `${format ? "format=" + format + "&" : ""}${width ? "width=" + width + "&" : ""}${
    height ? "height=" + height + "&" : ""
  }key=${key}${image_src ? "&image_src=" + image_src : ""}`
}

// const convertPathnameToSearchParams = (image_pathname: string, image_src: string): string => {
//   const path_arr = image_pathname.split("/")
//   const params_arr = path_arr[0].split("-")
//   const key = path_arr.slice(1).join("/")
//   const [format, width, height] = predicates.map(predicate => {
//     return trimParam(predicate, params_arr.find(p => p.startsWith(predicate)))
//   })
//   return `${format ? "format=" + format + "&" : ""}${width ? "width=" + width + "&" : ""}${
//     height ? "height=" + height + "&" : ""
//   }key=${key}${image_src ? "&image_src=" + image_src : ""}`
// }

const try_catch_handler = async (event: FetchEvent) => {
  try {
    const response = await handle(event)
    return response
  } catch (err) {
    return new Response(err.stack || err)
  }
}

sw_global.addEventListener("fetch", (_event: any) => {
  const event: FetchEvent = _event
  event.respondWith(try_catch_handler(event))
})

interface ServiceWorkerGlobalScope {
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void
}
declare const sw_global: ServiceWorkerGlobalScope

const getExample = () =>
  `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="X-UA-Compatible" content="ie=edge" />
    <title>Document</title>
  </head>
  <body style="margin:0">
    <picture>
      <source
        srcSet="https://img-proxy.palessit.dev/w_1170-f_webp/daniel.jpg 1170w,
        https://img-proxy.palessit.dev/w_970-f_webp/daniel.jpg 970w,
        https://img-proxy.palessit.dev/w_750-f_webp/daniel.jpg 750w,
        https://img-proxy.palessit.dev/w_320-f_webp/daniel.jpg 320w"
        type="image/webp"/>
      <source
        srcSet="https://img-proxy.palessit.dev/w_1170/daniel.jpg 1170w,
        https://img-proxy.palessit.dev/w_970/daniel.jpg 970w,
        https://img-proxy.palessit.dev/w_750/daniel.jpg 750w,
        https://img-proxy.palessit.dev/w_320/daniel.jpg 320w"/>
      <img src="https://img-proxy.palessit.dev/f_jpeg/daniel.jpg" alt="1"
    /></picture>
  </body>
</html>`
