// If the element isn't a media element, or if we've already attached it, this will throw an exception.
// So wrap this in a try/catch.
function getPannerForElement(audioContext, element) {
  var audioSource = audioContext.createMediaElementSource(element)
  var panner = audioContext.createPanner()
  var listener = audioContext.listener
  panner.panningModel = 'HRTF'
  panner.distanceModel = 'exponential'
  panner.refDistance = 1
  panner.maxDistance = 100
  panner.rolloffFactor = 1

  listener.forwardX.setValueAtTime(0, audioContext.currentTime)
  listener.forwardY.setValueAtTime(0, audioContext.currentTime)
  listener.forwardZ.setValueAtTime(-1, audioContext.currentTime)
  listener.upX.setValueAtTime(0, audioContext.currentTime)
  listener.upY.setValueAtTime(1, audioContext.currentTime)
  listener.upZ.setValueAtTime(0, audioContext.currentTime)

  audioSource.connect(panner)
  panner.connect(audioContext.destination)
  return panner
}

function normalize_range(input, inputMin, inputMax, outputMin, outputMax) {
  const percent = (input - inputMin) / (inputMax - inputMin)
  return percent * (outputMax - outputMin) + outputMin
}

// TODO: Make this adjustable in the UI
const narrowFactor = 0.15

function arrangeSourcesInSemiCircle(sources, distance = 3) {
  console.log("Rearranging sources to distance:", distance)
  let p, t, n
  if (sources.length > 1) {
    for (var i = 0; i < sources.length; i++) {
      p = sources[i].panner
      n = sources.length < 3 ? 0.5 : narrowFactor
      t = normalize_range(i, 0, sources.length - 1, 0 + n, Math.PI - n)
      p.positionZ.value = parseFloat((-1 * Math.sin(t)).toFixed(2)) * distance
      p.positionX.value = parseFloat((Math.cos(t)).toFixed(2)) * distance
      p.positionY.value = Math.random() * 2 // jitter the heights a little bit.
      console.log(`Setting Panner #${i} to \nx: ${p.positionX.value}, z: ${p.positionZ.value}, y: ${p.positionY.value}`)
    }
  }
  // Store updated panners.
  chrome.storage.sync.set({'pannerRegistry': serializePannerRegistry()})
}

var audioContext
const pannerRegistry = []
chrome.storage.sync.set({'pannerRegistry': serializePannerRegistry()})

function serializePannerRegistry() {
  const serialized = []
  for (let i=0; i < pannerRegistry.length; i++) {
    const {element, panner} = pannerRegistry[i]
    serialized.push({element: element.outerHTML, panner: {x: panner.positionX.value, y: panner.positionY.value, z: panner.positionZ.value}})
  }
  return serialized
}

// Anything that can play, can probably be added.
document.addEventListener('play', function (event) {
  const element = event.target
  if (!audioContext) {
    audioContext = new AudioContext()
  }
  // Ignore the self-video element in Online Town.
  if (element.id == 'self-video') {
    return
  }
  try {
    pannerRegistry.push({ 'element': element, 'panner': getPannerForElement(audioContext, element) })
    chrome.storage.sync.set({'pannerRegistry': serializePannerRegistry()})
  } catch (e) { console.log("Failed to add register panner because of ", e) }
}, true)

chrome.runtime.onMessage.addListener(function (request, sender) {
  if (request.message == 'rearrangeAudioSources') {
    chrome.storage.sync.get('distance', function (result) {
      const distance = result.distance || 3;
      arrangeSourcesInSemiCircle(pannerRegistry, distance)
    })
  }
})