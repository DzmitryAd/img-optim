import { createServer } from "http"
import { arePropsAllowed, parsePath, changeExt } from "./api-common"
import { readFile as fs_readFile } from "fs"
import { promisify } from "util"
import { normalize, join } from "path"
const readFile = promisify(fs_readFile)

const { PORT, WIDTHS = "", HEIGHTS = "", PUBLIC_DIR = "public" } = process.env
const port = (PORT && Number(PORT)) || 3000

const widths: number[] = WIDTHS.split(",").map(Number)
const heights: number[] = HEIGHTS.split(",").map(Number)

const mimeTypes = {
  png: "image/png",
  jpg: "image/jpg",
  webp: "image/webp",
}

const server = createServer(async (req, res) => {
  console.log(`${req.method} ${req.url}`)
  try {
    const url = new URL(req.url || "")
    // extract URL path
    // Avoid https://en.wikipedia.org/wiki/Directory_traversal_attack
    // e.g curl --path-as-is http://localhost:9000/../fileInDanger.txt
    // by limiting the path to current directory only
    const sanitizePath = normalize(url.pathname).replace(/^(\.\.[\/\\])+/, "")
    const pathname = join(__dirname, PUBLIC_DIR, sanitizePath)

    const img_props = parsePath(pathname)
    if (arePropsAllowed(img_props, widths, heights)) {
      res.writeHead(404)
      res.end("Not allowed image properties")
      return
    }

    const contentType = mimeTypes[img_props.format]
    const content = await readFile(filePath)

    res.writeHead(200, { "Content-Type": contentType })
    res.end(content)
  } catch (error) {
    if (error.code == "ENOENT") {
      res.writeHead(404, { "Content-Type": "text/html" })
      res.end("Not found")
    } else {
      console.log(error)
      res.writeHead(500)
      res.end("Error")
    }
  }
})

server.listen(port, () => {
  console.log("🚀 Server started", "http://localhost:" + port)
})
