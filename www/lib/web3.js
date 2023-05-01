const Buffer = require('buffer')
const solanaWeb3 = require("@solana/web3.js")
const splToken = require("@solana/spl-token")
const { GetProgramAccountsFilter, Keypair, Transaction, Connection, PublicKey } = require("@solana/web3.js")
const { TOKEN_PROGRAM_ID, createTransferCheckedInstruction, getAssociatedTokenAddress} = require("@solana/spl-token")

const http = require('./http.js')
const state = require('./state.js')

const MainNetBeta = 'https://api.mainnet-beta.solana.com'
const PaymentNet = 'https://api.metaplex.solana.com/'
const ToddLewisStudio = new PublicKey('J5zkMHjsfyYUEcie5Z2yPzohXeDBFAACdUGc13k8491f')
const ToddLewisCoin = new PublicKey('CUMJtmc2KVNrTEFHoohLSvJS3rdwqWLMhwSXSk1okntm')

state.save`cachetx`([])

const get_provider = () => {
  if ('phantom' in window) {
    const provider = window.phantom?.solana

    if (provider?.isPhantom) {
      return provider
    }
  }

  window.open('https://phantom.app/', '_blank')
}

const connect = async () => {
  const provider = get_provider()
  try {
      const resp = await provider.connect()
      console.log(resp.publicKey.toString())
      console.log(resp)
      state.save`pubkey`(resp.publicKey)
      state.save`connected`(true)
      balance()
      tlc_balance()
      return resp.publicKey
  } catch (err) {
      // { code: 4001, message: 'User rejected the request.' }
  }
}

const toFixed = (num, fixed) => 
    num.toString().match(new RegExp('^-?\\d+(?:\.\\d{0,' + (fixed || -1) + '})?'))[0];

const balance = async () => {
      const balanceRes = await http.post(`/balance/${state.load`pubkey`.toString()}`, {})
      console.log('balance', balanceRes)
      let value = balanceRes.balance * 0.000000001
      value = toFixed(value, 3)
      if(balanceRes.balance) state.save`balance`(value)
}

const tlc_balance = async () => {  
  const connection = new solanaWeb3.Connection(PaymentNet)
  const wallet = state.load`pubkey`
  console.log("getting tlc_balance...", wallet)

  const accounts = await connection.getParsedProgramAccounts(
      TOKEN_PROGRAM_ID, 
      { filters: [ { dataSize: 165 }, { memcmp: { offset: 32, bytes: wallet.toBase58() } } ] }
  )
  accounts.forEach((account, i) => {
      const parsedAccountInfo = account.account.data;
      const mintAddress = parsedAccountInfo["parsed"]["info"]["mint"];
      const tokenBalance = parsedAccountInfo["parsed"]["info"]["tokenAmount"]["uiAmount"];
      if(mintAddress === ToddLewisCoin.toString()) {
        state.save`tlc-account`(account.pubkey.toString())
        state.save`tlc-balance`(tokenBalance)
        console.log("---------")
        console.log(account.pubkey.toString())
        console.log("Balance: " + tokenBalance)
        console.log("---------")
      }
  })
}

const send_transaction = async transaction => {
  const provider = get_provider()
  const network = PaymentNet
  const connection = new solanaWeb3.Connection(network)
  let blockhash = (await connection.getLatestBlockhash('finalized')).blockhash
  console.log("recentBlockhash: ", blockhash)
  transaction.recentBlockhash = blockhash
  
  const { signature } = await provider.signAndSendTransaction(transaction)
  let res = await connection.getSignatureStatus(signature)

  return signature
}

const count_blocks = async (transaction, fn) => {
  const network = PaymentNet
  const connection = new solanaWeb3.Connection(network)
  let latestBlockhash = transaction.recentBlockhash
  let blocks = 0
  state.set`loading`(true)
  state.set`blocks`(blocks)
  const i = setInterval(async () => {
    let blockhash = (await connection.getLatestBlockhash('finalized')).blockhash
    if(latestBlockhash != blockhash){
      blocks++
      latestBlockhash = blockhash
      state.set`blocks`(blocks)
      if(blocks >= 3) {
        clearInterval(i)
        state.set`loading`(false)
        fn()
      }
    }   
  }, 1000)
}

const getTLCAccount = pubkey => splToken.getAssociatedTokenAddress(ToddLewisCoin, pubkey, false)

const send_tlc = async amount => {
  if(!state.load`pubkey`) {
    console.error('You aint logged in.')
    return null
  }
  const payer = state.load`pubkey`
  console.log(payer)
  
  let transaction = new solanaWeb3.Transaction()

  const tlc_accounts = [
      await getTLCAccount(payer),
      await getTLCAccount(ToddLewisStudio)
  ]

  console.log('tlc-accounts', tlc_accounts)
  
  transaction.add(
    splToken.createTransferCheckedInstruction(
      tlc_accounts[0],
      ToddLewisCoin,
      tlc_accounts[1],
      payer,
      amount,
      0
    )
  )
  transaction.feePayer = payer

  console.log("--Report")
  console.log("Payer")
  console.log(payer.toString())
  console.log("Payer TLC Account")
  console.log(tlc_accounts[0].toString())
  console.log(`--`)
  
  const sig = await send_transaction(transaction)
  console.log('signature', sig)

  count_blocks(transaction, async () => {
    balance()
    // const res = await http.post(`/buyalien/${state.load`pubkey`}/${alien}/${sig}`, {})
    console.log(res)
  })
}

module.exports = {
  balance, tlc_balance, connect, send_tlc
}