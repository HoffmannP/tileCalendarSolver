/* eslint-env browser */

function log (message) {
  document.querySelector('body').insertAdjacentHTML('beforeend', `<div>${message}</div>`)
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
  document.querySelector('body').insertAdjacentHTML('beforeend',
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
    return log(`Found ${message.count} solutions after ${Math.round(message.runtime / 100) / 10}s`)
  }
  console.log(message)
}

function startCalc (changeEvent) {
  this.addEventListener('message', receiveMessage)
  this.postMessage(changeEvent.target.valueAsDate)
}

document.addEventListener('DOMContentLoaded', () => {
  const worker = new Worker('worker.js')
  const date = document.querySelector('input')
  date.addEventListener('change', startCalc.bind(worker))
  date.valueAsDate = new Date()
  date.dispatchEvent(new Event('change'))
})
