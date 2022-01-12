/* eslint-env worker */

self.addEventListener('message', () =>
  self.setTimeout(
    self.postMessage(fibbonacci(
      Math.random(),
      Math.random(),
      1000000000
    ))
  )
)

function fibbonacci (a, b, size) {
  for (let i = 0; i < size; i++) {
    const tmp = a
    a = b
    b = (tmp + b) / 2
  }
  return b
}
