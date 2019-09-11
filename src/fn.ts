const AWS = require("aws-sdk")
import { BucketName, ObjectKey } from "aws-sdk/clients/s3"
const sharp = require("sharp")
const stream = require("stream")
const { S3_KEY, S3_SECRET } = process.env
const s3 = new AWS.S3({
  // signatureVersion: "v4",
  accessKeyId: S3_KEY,
  secretAccessKey: S3_SECRET,
})

type TStreamS3Props = {
  Bucket: BucketName
  Key: ObjectKey
}
const readStreamFromS3 = ({ Bucket, Key }: TStreamS3Props) => {
  return s3.getObject({ Bucket, Key }).createReadStream()
}

type TStreamWriteOptions = {
  ContentType: string
}
const writeStreamToS3 = ({ Bucket, Key }: TStreamS3Props, options: TStreamWriteOptions) => {
  const pass = new stream.PassThrough()
  return {
    writeStream: pass,
    uploadFinished: s3
      .upload({
        Body: pass,
        Bucket,
        ContentType: options.ContentType,
        Key,
      })
      .promise(),
  }
}

type TOptimProps = {
  width: number | null
  height: number | null
  format: "jpeg" | "png" | "webp" | null
}
const streamToSharp = ({ width, height, format }: TOptimProps) => {
  return format
    ? sharp()
        .resize(width, height)
        .toFormat(format)
    : sharp().resize(width, height)
}
type TNewKeyProps = TOptimProps & { key: string }
export const createNewKey = ({ width, height, format, key }: TNewKeyProps) => {
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

  return `${result}/${key}`
}

exports.readStreamFromS3 = readStreamFromS3
exports.writeStreamToS3 = writeStreamToS3
exports.streamToSharp = streamToSharp
exports.createNewKey = createNewKey
