/* eslint-env browser */

let worker

function log (message) {
  document.querySelector('.solutions')
    .insertAdjacentHTML('beforeend', `<div class="grid"><div class="text">${message}</div></div>`)
  console.log(message)
}

function formatCell (cell) {
  if (cell === ' ') {
    return '<div class="tile_x"></div>'
  }
  if (!isNaN(cell)) {
    return `<div class="tile_${cell}"></div>`
  }
  if (cell.startsWith('Day')) {
    return `<div class="tile_day">${cell.split(' ')[1] + '.'}</div>`
  }
  return `<div class="tile_date">${cell}</div>`
}

function showSolution (bord) {
  document.querySelector('.solutions').insertAdjacentHTML('beforeend',
    `<div class="grid">${bord.map((row) => row.map((cell) => formatCell(cell)
    ).join('')).join('')}</div>`
  )
}

function receiveMessage (messageEvent) {
  const message = messageEvent.data
  if (message.type === 'solution') {
    return showSolution(message.bord)
  }
  if (message.type === 'end') {
    document.querySelector('body').classList.remove('running')
    return log(`Found ${message.count} solutions after ${Math.round(message.runtime / 100) / 10}s`)
  }
}

function startCalc () {
  worker?.terminate()
  worker = new Worker('worker.js')
  document.querySelector('.solutions').innerHTML = ''
  document.querySelector('body').classList.add('running')
  const date = document.querySelector('[type="date"]').valueAsDate
  const surface = document.querySelector('[name="surface"]:checked').value
  worker.addEventListener('message', receiveMessage)
  worker.postMessage({ date, surface })
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelector('.surface')
    .addEventListener('change', startCalc)
  const date = document.querySelector('[type="date"]')
  date.addEventListener('change', startCalc)
  date.valueAsDate = new Date()
  date.dispatchEvent(new Event('change'))
})
