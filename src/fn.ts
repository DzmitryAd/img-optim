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
exports.readStreamFromS3 = ({ Bucket, Key }: TStreamS3Props) => {
  return s3.getObject({ Bucket, Key }).createReadStream()
}

type TStreamWriteOptions = {
  ContentType: string
}
exports.writeStreamToS3 = ({ Bucket, Key }: TStreamS3Props, options: TStreamWriteOptions) => {
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
  width: number
  height: number
  format: "jpeg" | "png" | "webp"
}
exports.streamToSharp = ({ width, height, format }: TOptimProps) => {
  return sharp()
    .resize(width, height)
    .toFormat(format)
}
type TKeyProps = TOptimProps & { key: string }
exports.createNewKey = ({ width, height, format, key }: TKeyProps) => {
  return format + "/w_" + width + "/h_" + height + "/" + key
}
