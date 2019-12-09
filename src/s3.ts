import { S3Client } from "@aws-sdk/client-s3-node/S3Client"
import { PutObjectCommand } from "@aws-sdk/client-s3-node/commands/PutObjectCommand"
import {
  GetObjectCommand,
  GetObjectOutput,
  GetObjectInput,
} from "@aws-sdk/client-s3-node/commands/GetObjectCommand"
// import { BucketName, ObjectKey } from "aws-sdk/clients/s3"
import { PassThrough } from "stream"
const { S3_KEY, S3_SECRET } = process.env

if (!S3_KEY) {
  throw new Error("Invalid S3_KEY")
}
if (!S3_SECRET) {
  throw new Error("Invalid S3_SECRET")
}

const s3 = new S3Client({
  credentials: {
    secretAccessKey: S3_SECRET,
    accessKeyId: S3_KEY,
  },
})

export const readStreamFromS3 = ({ Bucket, Key }: GetObjectInput) => {
  const getObjectComand = new GetObjectCommand({ Bucket, Key })
  return s3.send(getObjectComand)
}

type TStreamS3Props = {
  Bucket: BucketName
  Key: ObjectKey
}
type TStreamWriteOptions = {
  ContentType: string
}
export const writeStreamToS3 = ({ Bucket, Key }: TStreamS3Props, options: TStreamWriteOptions) => {
  const pass = new PassThrough()
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
