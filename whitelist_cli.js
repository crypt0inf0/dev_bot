const javalon = require('javalon')
const fs = require('fs')

const callback = (err) => { if (err) { throw err; } console.log("Updated...") };

const username = 'crypt0inf0';
const priv_key = '9Wsk1k8E9dJJQdje5AER2y59Bzpn51S4hztT22uGEFp6';

javalon.getAccounts([process.argv[2]], (err, accounts) => {
  // console.log(err, accounts)
  let _id = accounts[0]._id
  let user = accounts[0].name
  let status = 'whitelist'
  let reason = 'original dtuber'
  let vp = process.argv[3] // change vp accoding to the user

  var newTx = {
    type: javalon.TransactionType.NEW_ACCOUNT,
    data: {
        _id: _id,
        user: user,
        status: status,
        reason: reason,
        vp: vp

    }
  }
  
  newTx = javalon.sign(priv_key, username, newTx)

  var whitelist = {
    _id: _id,
    user: user,
    status: status,
    reason: reason,
    vp: vp,
    sender: newTx.sender,
    ts: newTx.ts,
    hash: newTx.hash,
    signature: newTx.signature
  }

  var data = fs.readFileSync('./db/whitelist.json');
  var users = JSON.parse(data);
  users.push(whitelist);
  fs.writeFile("./db/whitelist.json", JSON.stringify(users, null, 2), 'utf8', callback);
})

