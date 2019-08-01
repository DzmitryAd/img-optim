import { S3 } from "aws-sdk"
import { BucketName, ObjectKey } from "aws-sdk/clients/s3"
import sharp from "sharp"
import stream from "stream"

const s3 = new S3({
  signatureVersion: "v4",
})

type TStreamS3Props = {
  Bucket: BucketName
  Key: ObjectKey
}
export const readStreamFromS3 = ({ Bucket, Key }: TStreamS3Props) => {
  return s3.getObject({ Bucket, Key }).createReadStream()
}

type TStreamWriteOptions = {
  ContentType: string
}
export const writeStreamToS3 = ({ Bucket, Key }: TStreamS3Props, options: TStreamWriteOptions) => {
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
export const streamToSharp = ({ width, height, format }: TOptimProps) => {
  return sharp()
    .resize(width, height)
    .toFormat(format)
}
