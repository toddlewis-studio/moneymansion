const toml = require('toml')

const post = async (url, body, isToml) => {
  let res = await fetch(url, {
    method: 'POST',
    mode: 'no-cors',
    cache: 'no-cache',
    headers: {
      'Content-Type': 'application/json'
      // 'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: JSON.stringify(body)
  })
  return isToml ? toml.parse(await res.text()) : res.json()
}

module.exports = {post}