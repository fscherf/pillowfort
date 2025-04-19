export function helloWorld(): undefined {
  const helloWorldDiv: HTMLDivElement =
    document.querySelector("div#hello-world");

  helloWorldDiv.innerHTML = "Hello World";
}
