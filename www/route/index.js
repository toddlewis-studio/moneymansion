const {LitElement, css, html, nothing} = require('lit')
const state = require('../lib/state.js')
const web3 = require('../lib/web3.js')
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
  async connect(){
    console.log("connect")
    await web3.connect()
    await web3.moneyboy_balance()
  }
  render = () => html`
    <h1>Hello World</h1>
    <button @click="${this.connect}">Connect</button>
  `
  static styles = css``
})
module.exports = customElements.get('index-route')