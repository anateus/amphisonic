var distanceInput, rearrangeButton

function element(e, a) {
  const d = document.createElement(e)
  let i = 1
  if (a && typeof a == 'object' && !(a instanceof Node)) {
    for (attr in a) {
      d.setAttribute(attr, a[attr])
    }
    i++
  }
  for (; i < arguments.length; i++) {
    const c = arguments[i]
    if (typeof c == 'string') {
      d.appendChild(document.createTextNode(c))
    } else {
      d.appendChild(c)
    }
  }
  return d
}

function div() { return element('div', ...arguments) }

function b() { return element('b', ...arguments) }
function table() { return element('table', ...arguments) }
function tr() { return element('tr', ...arguments) }
function th() { return element('th', ...arguments) }
function td() { return element('td', ...arguments) }

document.addEventListener("DOMContentLoaded", function () { 
  renderPannerRegistry()

  distanceInput = document.getElementById('distanceInput')
  rearrangeButton = document.getElementById('rearrangeButton')

  distanceInput.addEventListener('input', function (i, event) {
    const distance = distanceInput.value
    chrome.storage.sync.get('distance', function (result) {
      if (result.distance != distance) {
        chrome.storage.sync.set({ 'distance': distance }, rearrangeAudioSources)
      }
    })
  })

  rearrangeButton.addEventListener('click', rearrangeAudioSources)

  chrome.storage.sync.get('distance', function (result) {
    distanceInput.value = result.distance || 3;
  })
})

function rearrangeAudioSources() {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    const activeTab = tabs[0]
    chrome.tabs.sendMessage(activeTab.id, { message: 'rearrangeAudioSources' })
  })
}

// chrome.runtime.onMessage.addListener(function (request, sender) {
//   if (request.message == 'arrangementUpdated') {
//     renderPannerRegistry();
//   }
// }

function renderPannerRegistry() {
  chrome.storage.sync.get('pannerRegistry', function (result) {
    const pannerRegistry = result.pannerRegistry
    const audioSources = document.getElementById('audioSources')
    while (audioSources.firstChild) {
      audioSources.removeChild(audioSources.lastChild)
    }
    const sourceTable = table({width: '200px'},
        tr(th('Name'), th('x'), th('z'), th('y'))
    )
    for (let i = 0; i < pannerRegistry.length; i++) {
      const { panner, element } = pannerRegistry[i];

      sourceTable.appendChild(
        tr(
          b({title: element}, `Panner #${i}`),
          td(panner.x.toPrecision(2)),
          td(panner.z.toPrecision(2)),
          td(panner.y.toPrecision(2))
        ))
        
    }
    audioSources.appendChild(sourceTable)
  })
}

chrome.storage.onChanged.addListener(function (changes, areaName) {
  if ('pannerRegistry' in changes) {
    renderPannerRegistry();
  }
})