import { TestBrowserInterface } from "@/browser-interface";
import { parseCSSValue, CSSValue } from "@/css";
import { Viewport } from "@/rendering/2d/types";
import { Layer } from "@/rendering/2d/layer";
import { App } from "@/rendering/2d/app";

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

test("Viewport Calculations", () => {
  // setup HTML
  document.body.innerHTML = `
    <div id="main"></div>
  `;

  // setup app
  const appViewport: Viewport = {
    x: 0,
    y: 0,
    width: 800,
    height: 600,
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  };

  const testBrowserInterface: TestBrowserInterface = new TestBrowserInterface();

  const app: App = new App({
    browserInterface: testBrowserInterface,
    rootElement: document.querySelector("#main"),
  });

  testBrowserInterface.viewport = appViewport;

  // setup layer
  const layer: Layer = new Layer();

  app.layerAdd(layer);

  // if nothing is set, the layer should be streched to full width and height
  layer.height = "";
  layer.width = "";
  layer.top = "";
  layer.right = "";
  layer.bottom = "";
  layer.left = "";

  app.resize(800, 600);

  expect(layer.viewport).toStrictEqual({
    x: 0,
    y: 0,
    width: 800,
    height: 600,
    top: 0,
    right: 800,
    bottom: 600,
    left: 0,
  });

  // full width, full height
  layer.height = "100%";
  layer.width = "100%";
  layer.top = "";
  layer.right = "";
  layer.bottom = "";
  layer.left = "";

  app.resize(800, 600);

  expect(layer.viewport).toStrictEqual({
    x: 0,
    y: 0,
    width: 800,
    height: 600,
    top: 0,
    right: 800,
    bottom: 600,
    left: 0,
  });

  // half width, half height
  layer.height = "50%";
  layer.width = "50%";
  layer.top = "";
  layer.right = "";
  layer.bottom = "";
  layer.left = "";

  app.resize(800, 600);

  expect(layer.viewport).toStrictEqual({
    x: 0,
    y: 0,
    width: 400,
    height: 300,
    top: 0,
    right: 400,
    bottom: 300,
    left: 0,
  });

  // top, right, bottom, and left set; width and height streched
  layer.height = "";
  layer.width = "";
  layer.top = "20px";
  layer.right = "40px";
  layer.bottom = "40px";
  layer.left = "20px";

  app.resize(800, 600);

  expect(layer.viewport).toStrictEqual({
    x: 20,
    y: 20,
    width: 740,
    height: 540,
    top: 20,
    right: 760,
    bottom: 560,
    left: 20,
  });

  // top left aligned
  layer.height = "80px";
  layer.width = "100px";
  layer.top = "10px";
  layer.right = "";
  layer.bottom = "";
  layer.left = "10px";

  app.resize(800, 600);

  expect(layer.viewport).toStrictEqual({
    x: 10,
    y: 10,
    width: 100,
    height: 80,
    top: 10,
    right: 110,
    bottom: 90,
    left: 10,
  });

  // bottom right aligned
  layer.height = "80px";
  layer.width = "100px";
  layer.top = "";
  layer.right = "10px";
  layer.bottom = "10px";
  layer.left = "";

  app.resize(800, 600);

  expect(layer.viewport).toStrictEqual({
    x: 690,
    y: 510,
    width: 100,
    height: 80,
    top: 510,
    right: 790,
    bottom: 590,
    left: 690,
  });

  // if left, right and width are set, the layer should fall back to being
  // left aligned
  layer.height = "";
  layer.width = "100px";
  layer.top = "";
  layer.right = "10px";
  layer.bottom = "";
  layer.left = "10px";

  app.resize(800, 600);

  expect(layer.viewport).toStrictEqual({
    x: 10,
    y: 0,
    width: 100,
    height: 600,
    top: 0,
    right: 110,
    bottom: 600,
    left: 10,
  });

  // if right, bottom and height are set, the layer should fall back to being
  // top aligned
  layer.height = "100px";
  layer.width = "";
  layer.top = "10px";
  layer.right = "";
  layer.bottom = "10px";
  layer.left = "";

  app.resize(800, 600);

  expect(layer.viewport).toStrictEqual({
    x: 0,
    y: 10,
    width: 800,
    height: 100,
    top: 10,
    right: 800,
    bottom: 110,
    left: 0,
  });
});
