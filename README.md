https://travis-ci.com/palessit/img-optim.svg?branch=master

Service for onfly size and format image convertation

For build lambda part, use node 10.x

In AWS lamda need to specify some env for s3 config: bucket, region, api key and secret
In worker KV need to specify URL for lambda API Gateway and also URL for s3 bucket which store formatted images and default URL for images src

Usage:

url format:
_workerUrl_/params/key?image*src=\_imageSrcUrl*

workerUrl - required - url where worker resonse

params - required:
format as f\_
width as w\_
height as h\_
separated with "-"
need at least one parameter

if format is not specified, servicce will try set image extension as format.

key - required - key of image in s3 bucket or path to image in origin server

imageSrcUrl - optional - url of image origin. If specified, service willn't request to default image server

url examples:

https://img-proxy.palessit.dev/f_webp-w_800-h_600/scarlett.jpg for webp image with width=800px and height=600px
https://img-proxy.palessit.dev/w_800-h_600/scarlett.jpg for jpeg image with width=800px and height=600px
https://img-proxy.palessit.dev/f_webp-h_600/scarlett.jpg for webp image with height=600px
https://img-proxy.palessit.dev/h_600/scarlett.jpg for jpeg image with height=600px
https://img-proxy.palessit.dev/f_webp/scarlett.jpg for webp image with original size

https://img-proxy.palessit.dev/scarlett.jpg ERROR because no one parameter specified

https://img-proxy.palessit.dev/f_webp-h_600/scarlett.jpg?image_src=http://images6.fanpop.com/image/photos/42700000/Scarlett-Johansson-scarlett-johansson-42744568-1200-1600.jpg save picture from src to s3 bucket with specified params and set key scarlett.webp (if extension and params format are different - format have privilege)

NOTICE! if you want to specified format throw extension and s3 don't store formatted image with specified size params and this extension, service will try to find original image and read key as path to original image. So if you still want to specify format throw ext, you shall specify directly url with image_src as example:
https://img-proxy.palessit.dev/h_600/scarlett.webp?image_src=http://images6.fanpop.com/image/photos/42700000/Scarlett-Johansson-scarlett-johansson-42744568-1200-1600.jpg
