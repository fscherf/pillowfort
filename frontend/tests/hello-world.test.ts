import { helloWorld } from "@/hello-world";

test("Hello World", () => {
  document.body.innerHTML = `
    <div id="hello-world"></div>
  `;

  expect(document.querySelector("#hello-world").innerHTML).not.toBe(
    "Hello World",
  );

  helloWorld();

  expect(document.querySelector("#hello-world").innerHTML).toBe("Hello World");
});
