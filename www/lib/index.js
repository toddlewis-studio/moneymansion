import TLCIcon from '../asset/tlc.jpg'
const ui = require('./ui.js')
const state = require('./state.js')
// const w3 = require('./web3.js')
// const http = require('./http.js')

const meta = a => {
  const property = a[0]
  return content => {
    const el = document.createElement('meta')
    el.property = property
    el.content = content
    return el
  }
}
const link = a => {
  const rel = a[0]
  return href => {
    const el = document.createElement('link')
    el.rel = rel
    el.href = href
    return el
  }
}

;[
  meta`og:image`(TLCIcon),
  link`apple-touch-icon`(TLCIcon),
  link`icon`(TLCIcon),
  link`favicon`(TLCIcon)
].forEach(e => document.head.appendChild(e))

let cachedRoutes = {}, currentRoute
let updateRoute = () => {
  let hash = location.hash
  if(!hash || hash == '' || hash === '#') hash = 'index'
  if(hash && hash[0] === '#') hash = hash.substr(1)
  if(ui[hash]) {
    if(currentRoute) document.body.removeChild(currentRoute)
    if(cachedRoutes[hash]) currentRoute = cachedRoutes[hash]
    else currentRoute = cachedRoutes[hash] = new ui[hash]()
    state.clear()
    currentRoute.requestUpdate()
    document.body.appendChild(currentRoute)
  }
}

onhashchange = updateRoute
updateRoute()