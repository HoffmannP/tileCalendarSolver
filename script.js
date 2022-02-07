/* eslint-env browser */

let worker

const $ = selector => document.querySelector(selector)

function formatCell (cell) {
  if (cell === ' ') {
    return '<div class="tile_x"></div>'
  }
  if (!isNaN(cell)) {
    return `<div class="tile_${cell}"></div>`
  }
  if (cell.startsWith('d')) {
    return `<div class="tile_day">${cell.substr(1) + '.'}</div>`
  }
  return `<div class="tile_date">${cell}</div>`
}

function receiveMessage (messageEvent) {
  const message = messageEvent.data
  if (message.type === 'end') {
    $('body').classList.remove('running')
    $('.solutions').insertAdjacentHTML('beforeend',
      `<div class="grid"><div class="text">Found ${message.count} solutions after ${Math.round(message.runtime / 100) / 10}s</div></div>`
    )
    return
  }
  $('.solutions').insertAdjacentHTML('beforeend',
    `<div class="grid">${
      message.bord.map(row => row.map(formatCell).join('')).join('')}</div>`
  )
}

function startCalc () {
  worker?.terminate()
  worker = new Worker('worker.js')
  $('.solutions').innerHTML = ''
  $('body').classList.add('running')
  worker.addEventListener('message', receiveMessage)
  worker.postMessage({
    date: $('[type="date"]').valueAsDate,
    surface: $('[name="surface"]:checked').value
  })
}

document.addEventListener('DOMContentLoaded', () => {
  const date = $('[type="date"]')
  $('.surface').addEventListener('change', startCalc)
  date.addEventListener('change', startCalc)
  date.valueAsDate = new Date()
  date.dispatchEvent(new Event('change'))
})
