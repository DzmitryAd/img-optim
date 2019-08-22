import { changeExt, createSarchParams, parsePath, trimParam } from "./worker"
test("remove predicate 'f_' from 'f_200'", () => {
  expect(trimParam("f_", "f_200")).toBe("200")
})
test("return null if param is undefined", () => {
  expect(trimParam("f_", undefined)).toBe(null)
})

test("change extension", () => {
  expect(changeExt("pict.jpeg", "webp")).toBe("pict.webp")
})
test("keep extension where new ext is null", () => {
  expect(changeExt("folder/pict.jpeg", null)).toBe("folder/pict.jpeg")
})

test("parse pathname '/h_300-w_500-f_webp/pict.jpeg'", () => {
  expect(parsePath("/h_300-w_500-f_webp/pict.jpeg")).toEqual({
    format: "webp",
    width: 500,
    height: 300,
    key: "pict.webp",
    oldKey: "pict.jpeg",
  })
})
test("and create search string", () => {
  expect(
    createSarchParams(
      {
        format: "webp",
        width: 500,
        height: 300,
        key: "pict.webp",
        oldKey: "pict.jpeg",
      },
      "http://some-site.com/uploads"
    )
  ).toBe("format=webp&width=500&height=300&key=pict.webp&image_src=http://some-site.com/uploads")
})
test("parse pathname '/h_300-w_500/pict.jpeg'", () => {
  expect(parsePath("/h_300-w_500/pict.jpeg")).toEqual({
    format: "jpeg",
    width: 500,
    height: 300,
    key: "pict.jpeg",
    oldKey: "pict.jpeg",
  })
})
test("and create search string", () => {
  expect(
    createSarchParams(
      {
        format: "jpeg",
        width: 500,
        height: 300,
        key: "pict.jpeg",
        oldKey: "pict.jpeg",
      },
      "http://some-site.com/uploads"
    )
  ).toBe("format=jpeg&width=500&height=300&key=pict.jpeg&image_src=http://some-site.com/uploads")
})
test("parse pathname '/h_300-f_webp/pict.jpeg'", () => {
  expect(parsePath("/h_300-f_webp/pict.jpeg")).toEqual({
    format: "webp",
    width: null,
    height: 300,
    key: "pict.webp",
    oldKey: "pict.jpeg",
  })
})
test("and create search string", () => {
  expect(
    createSarchParams(
      {
        format: "webp",
        width: null,
        height: 300,
        key: "pict.webp",
        oldKey: "pict.jpeg",
      },
      "http://some-site.com/uploads"
    )
  ).toBe("format=webp&height=300&key=pict.webp&image_src=http://some-site.com/uploads")
})
test("parse pathname '/f_webp/pict.jpeg'", () => {
  expect(parsePath("/f_webp/pict.jpeg")).toEqual({
    format: "webp",
    width: null,
    height: null,
    key: "pict.webp",
    oldKey: "pict.jpeg",
  })
})
test("and create search string", () => {
  expect(
    createSarchParams(
      {
        format: "webp",
        width: null,
        height: null,
        key: "pict.webp",
        oldKey: "pict.jpeg",
      },
      "http://some-site.com/uploads"
    )
  ).toBe("format=webp&key=pict.webp&image_src=http://some-site.com/uploads")
})
test("parse pathname '/h_300/pict.jpeg'", () => {
  expect(parsePath("/h_300/pict.jpeg")).toEqual({
    format: "jpeg",
    width: null,
    height: 300,
    key: "pict.jpeg",
    oldKey: "pict.jpeg",
  })
})
test("and create search string", () => {
  expect(
    createSarchParams(
      {
        format: "jpeg",
        width: null,
        height: 300,
        key: "pict.jpeg",
        oldKey: "pict.jpeg",
      },
      "http://some-site.com/uploads"
    )
  ).toBe("format=jpeg&height=300&key=pict.jpeg&image_src=http://some-site.com/uploads")
})
test("parse pathname '/h_300-f_webp/some-folder/pict.jpeg'", () => {
  expect(parsePath("/h_300/pict.jpeg")).toEqual({
    format: "webp",
    width: null,
    height: 300,
    key: "some-folder/pict.webp",
    oldKey: "some-folder/pict.jpeg",
  })
})
test("and create search string", () => {
  expect(
    createSarchParams(
      {
        format: "webp",
        width: null,
        height: 300,
        key: "some-folder/pict.webp",
        oldKey: "some-folder/pict.jpeg",
      },
      "http://some-site.com/uploads"
    )
  ).toBe("format=webp&height=300&key=some-folder/pict.webp&image_src=http://some-site.com/uploads")
})
