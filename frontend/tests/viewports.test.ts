import { parseCSSValue, CSSValue } from "@/css";

test("CSS Value Parsing", () => {
  let cssValue: CSSValue;

  // invalid values
  // foo
  expect(() => {
    parseCSSValue("foo");
  }).toThrow();

  // 100em
  expect(() => {
    parseCSSValue("100em");
  }).toThrow();

  // 10,10px
  expect(() => {
    parseCSSValue("10,10px");
  }).toThrow();

  // valid values values without a unit
  // 0
  cssValue = parseCSSValue("0");

  expect(cssValue).toStrictEqual({
    unit: "px",
    value: 0,
  });

  // 100
  cssValue = parseCSSValue("100");

  expect(cssValue).toStrictEqual({
    unit: "px",
    value: 100,
  });

  // 75
  cssValue = parseCSSValue("75");

  expect(cssValue).toStrictEqual({
    unit: "px",
    value: 75,
  });

  // -75
  cssValue = parseCSSValue("-75");

  expect(cssValue).toStrictEqual({
    unit: "px",
    value: -75,
  });

  // -75.55
  cssValue = parseCSSValue("-75.55");

  expect(cssValue).toStrictEqual({
    unit: "px",
    value: -75.55,
  });

  // valid percentage values
  // 0%
  cssValue = parseCSSValue("0%");

  expect(cssValue).toStrictEqual({
    unit: "percent",
    value: 0,
  });

  // 100%
  cssValue = parseCSSValue("100%");

  expect(cssValue).toStrictEqual({
    unit: "percent",
    value: 100,
  });

  // 75%
  cssValue = parseCSSValue("75%");

  expect(cssValue).toStrictEqual({
    unit: "percent",
    value: 75,
  });

  // -75%
  cssValue = parseCSSValue("-75%");

  expect(cssValue).toStrictEqual({
    unit: "percent",
    value: -75,
  });

  // -75.55%
  cssValue = parseCSSValue("-75.55%");

  expect(cssValue).toStrictEqual({
    unit: "percent",
    value: -75.55,
  });
});
