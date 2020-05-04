var distanceInput, rearrangeButton

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

function renderPannerRegistry() {
  chrome.storage.sync.get('pannerRegistry', function (result) {
    const pannerRegistry = result.pannerRegistry
    console.log(pannerRegistry);
    const audioSources = document.getElementById('audioSources')
    while (audioSources.firstChild) {
      audioSources.removeChild(audioSources.lastChild)
    }
    for (let i = 0; i < pannerRegistry.length; i++) {
      const { panner, element } = pannerRegistry[i];
      const source = document.createElement('div')
      source.textContent = `Panner #${i} ${element} x: ${panner.x}, z: ${panner.z}, y: ${panner.y}`
      audioSources.appendChild(source)
    }
  })
}

chrome.storage.onChanged.addListener(function (changes, areaName) {
  if ('pannerRegistry' in changes) {
    renderPannerRegistry();
  }
})