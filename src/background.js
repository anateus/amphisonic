chrome.storage.onChanged.addListener(function (changes, areaName) {
  if ('pannerRegistry' in changes) {
    chrome.storage.sync.get('pannerRegistry', function (result) {
      const len = result.pannerRegistry.length
      chrome.browserAction.setBadgeText({text: len < 1 ? '' : `${len}`})
    })

  }
})