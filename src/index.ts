import { APIGatewayProxyHandler } from "aws-lambda"
import { readStreamFromS3, streamToSharp, writeStreamToS3 } from "./fn"

// const URL = `http://${BUCKET}.s3-website.${REGION}.amazonaws.com`

type TQueryStringParameters = {
  bucket: string
  key: string
  width: string
  height: string
}

const handler: APIGatewayProxyHandler = async event => {
  if (!event.queryStringParameters) {
    return {
      statusCode: 404,
      body: "queryStringParameters do not exist",
    }
  }
  const params: TQueryStringParameters = event.queryStringParameters as TQueryStringParameters
  const bucket_origin = params.bucket
  const bucket_destination = params.bucket
  const key = params.key
  const width = Number(params.width)
  const height = Number(params.height)

  const newKey = "" + width + "x" + height + "/" + key
  const imageLocation = `${URL}/${newKey}`

  const format = "webp"

  try {
    const readStream = readStreamFromS3({ Bucket: bucket_origin, Key: key })
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

export { handler }
