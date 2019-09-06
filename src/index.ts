import { APIGatewayProxyHandler } from "aws-lambda"
const { createNewKey, readStreamFromS3, streamToSharp, writeStreamToS3 } = require("./fn")
const fetch = require("node-fetch")
const { BUCKET, REGION } = process.env
const URL = `http://${BUCKET}.s3.${REGION}.amazonaws.com`
const allowedFormats = ["jpeg", "png", "webp"]
type TQueryStringParameters = {
  format?: string
  width?: string
  height?: string
  key: string
  image_src?: string
}

const handler: APIGatewayProxyHandler = async event => {
  if (!(event.queryStringParameters && event.queryStringParameters.key)) {
    return {
      statusCode: 404,
      body: "queryStringParameters do not exist",
    }
  }
  const params: TQueryStringParameters = event.queryStringParameters as TQueryStringParameters
  const bucket_origin = BUCKET
  const bucket_destination = BUCKET
  const key = decodeURIComponent(params.key)
  const image_src = params.image_src || null
  const width = params.width ? Number(params.width) : null
  const height = params.height ? Number(params.height) : null
  const keyArr = key ? key.split(".") : []
  const ext = keyArr.length > 1 ? keyArr[keyArr.length - 1] : null
  let format = params.format || ext
  if (format === "jpg") {
    format = "jpeg"
  }
  console.log("format", format)
  if (!format || !allowedFormats.includes(format)) {
    return {
      statusCode: 400,
      body: "right format must be specified",
    }
  }
  const newKey = createNewKey({
    width,
    height,
    format,
    key,
  })
  const imageLocation = `${URL}/${encodeURIComponent(newKey)}`

  try {
    if (image_src) {
      console.log("fetch to", image_src)
    }
    const readStream = image_src
      ? (await fetch(image_src)).body
      : readStreamFromS3({ Bucket: bucket_origin, Key: key })
    const resizeStream = streamToSharp({ width, height, format })
    const { writeStream, uploadFinished } = writeStreamToS3(
      { Bucket: bucket_destination, Key: newKey },
      { ContentType: "image/" + format }
    )
    readStream.pipe(resizeStream).pipe(writeStream)
    const uploadedData = await uploadFinished

    console.log("Data: ", {
      ...uploadedData,
      BucketEndpoint: URL,
      ImageURL: imageLocation,
    })

    // return a 301 redirect to the newly created resource in S3
    return {
      statusCode: 301,
      headers: { location: imageLocation },
      body: "",
    }
  } catch (err) {
    console.error(err)
    return {
      statusCode: 500,
      body: err.message,
    }
  }
}

exports.handler = handler
