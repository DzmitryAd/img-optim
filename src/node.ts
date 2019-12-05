import { createServer } from "http"
import { arePropsAllowed, parsePath, changeExt } from "./api-common"
const { PORT, WIDTHS = "", HEIGHTS = "" } = process.env
const port = (PORT && Number(PORT)) || 3000

const widths: number[] = WIDTHS.split(",").map(Number)
const heights: number[] = HEIGHTS.split(",").map(Number)

const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url || "")
    const img_props = parsePath(url.pathname)
    if (arePropsAllowed(img_props, widths, heights)) {
      response.statusCode = 404
      response.end("Not allowed image properties")
      return
    }
  } catch (e) {
    console.log(e)
    response.end(e)
  }
})

server.listen(port, () => {
  console.log("🚀 Server started", "http://localhost:" + port)
})
