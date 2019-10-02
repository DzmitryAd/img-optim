# IMG-OPTIM

Service for onfly size and format image convertation [![Build Status](https://travis-ci.com/palessit/img-optim.svg?branch=master)](https://travis-ci.com/palessit/img-optim)

### Instalation

For build lambda part, use node 10.x

Go to project root dir and run

```
yarn
tsc -p tsconfig.json
```

##### AWS-LAMBDA part

Pack the node_modules folder and files _fn.js_ and _index.js_ to zip archive and upload it to AWS-LAMBDA

In AWS lamda need to specify some env for s3 config:

- S3 bucket name as BUCKET
- S3 region as REGION
- s3 access key id as S3_KEY
- s3 secret access key as S3_SECRET

##### Cloudflare worker part

Go to _dist/worker.js_ and specify some constants:

- API_GATEWAY_URL - url for lambda API Gateway
- FORMATED_IMG_URL_PREFIX - url for s3 bucket which store formatted images
- ORIGIN_IMG_URL_PREFIX - default url for images src

Then copy all code and paste it to cloudflare worker editor.

After that you need to add some clouflare route and deploy code to this route directly from editor.

### Usage

url format:
_workerUrl_/_params_/_key_?image_src=_imageSrcUrl_

**workerUrl** - required - url where worker resonse

**params** separated with **"-"** - required:

- format as _f\__
- width as _w\__
- height as _h\__
- quality between 1 and 100 as _q\__. Default quality is 85

need at least one parameter.

if format is not specified, servicce will try to set image extension as format.

**key** - required - key of image in s3 bucket or path to image on origin server

**imageSrcUrl** - optional - url of image origin. If specified, service willn't request to default image server

##### Examples:

https://img-proxy.palessit.dev/f_webp-w_800-h_600/scarlett.jpg - for **webp** image with **width=800px** and **height=600px**

https://img-proxy.palessit.dev/w_800-h_600/scarlett.jpg - for **jpeg** image with **width=800px** and **height=600px**

https://img-proxy.palessit.dev/f_webp-h_600/scarlett.jpg - for **webp** image with **height=600px**

https://img-proxy.palessit.dev/h_600/scarlett.jpg - for **jpeg** image with **height=600px**

https://img-proxy.palessit.dev/f_webp/scarlett.jpg - for **webp** image with original size

https://img-proxy.palessit.dev/scarlett.jpg - **ERROR** because no one parameter specified

https://img-proxy.palessit.dev/f_webp-h_600/scarlett.jpg?image_src=http://images6.fanpop.com/image/photos/42700000/Scarlett-Johansson-scarlett-johansson-42744568-1200-1600.jpg - save picture from src to s3 bucket with specified params and set **key** scarlett.webp (if extension and params format are different - format have privilege)

**NOTICE!** if you want to specify format throw extension and s3 don't store formatted image with specified size params and this extension, service will try to find original image and read key as path to original image. So if you still want to specify format throw ext, you shall specify directly url with image_src as example:
https://img-proxy.palessit.dev/h_600/scarlett.webp?image_src=http://images6.fanpop.com/image/photos/42700000/Scarlett-Johansson-scarlett-johansson-42744568-1200-1600.jpg

