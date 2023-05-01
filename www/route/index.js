const {LitElement, css, html, nothing} = require('lit')
const state = require('../lib/state.js')
const TwitterIcon = require('../asset/twitter.png')

customElements.define('index-route', class extends LitElement {
  constructor() { super() }
  connectedCallback(){
    super.connectedCallback()
    this.listener = state.listener(this)();
  }
  disconnectedCallback(){
    super.disconnectedCallback()
    this.listener.forEach(off => off())
  }
  render = () => html`
    <h1>Hello World</h1>
  `
  static styles = css``
})
module.exports = customElements.get('index-route')