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
  IMG_URL_PREFIX: string
}

const handle = async (event: FetchEvent) => {
  const env: TWorkerCtxEnv = await kvEnvStore.getEnv()
  const url = new URL(event.request.url)
  const image_src = url.searchParams.get("image_src")
  const target_url = env.IMG_URL_PREFIX + url.pathname
  const cache: Cache = (caches as any).default
  const cahed_responce = await cache.match(target_url)
  if (cahed_responce) {
    return cahed_responce
  }

  const reqHeaders = new Headers(event.request.headers)
  reqHeaders.set("Cache-Control", "max-age=31536000")
  let origin_response = await fetch(target_url)
  if (!origin_response.ok) {
    const gateWayUrl =
      env.API_GATEWAY_URL + "?" + convertPathnameToSearchParams(url.pathname.slice(1), image_src)
    origin_response = await fetch(gateWayUrl)
  }
  const headers = new Headers(origin_response.headers)
  const responce_clone = new Response(origin_response.clone().body, {
    headers,
  })
  headers.delete("set-cookie")
  headers.set("Cache-Control", "max-age=31536000")
  event.waitUntil(cache.put(target_url, responce_clone.clone()))
  return responce_clone
}

const trimParam = (predicate: string, param: string | undefined): string | null => {
  return param ? param.replace(predicate, "") : null
}
const predicates = ["f_", "w_", "h_"]

const convertPathnameToSearchParams = (
  image_pathname: string,
  image_src: string | null
): string => {
  const path_arr = image_pathname.split("/")
  const params_arr = path_arr[0].split("-")
  const key = path_arr.length === 1 ? path_arr[0] : path_arr[1]
  const [format, width, height] = predicates.map(predicate => {
    return trimParam(predicate, params_arr.find(p => p.startsWith(predicate)))
  })
  return `${format ? "format=" + format + "&" : ""}${width ? "width=" + width + "&" : ""}${
    height ? "height=" + height + "&" : ""
  }key=${key}${image_src ? "&image_src=" + image_src : ""}`
}

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
