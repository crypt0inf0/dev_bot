const javalon = require('javalon')
const fs = require('fs')
const callback = (err) => { if (err) { throw err; } console.log("Updated...") };

const username = '';
const priv_key = '';

javalon.getAccounts(['sperm-bot-01'], (err, accounts) => {
  // console.log(err, accounts)
  let _id = accounts[0]._id
  let user = accounts[0].name
  let status = 'blacklist'
  let reason = 'sperm'
  let vp = 20 // change vp accoding to the user

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

  var blacklist_db = {
    _id: _id,
    username: user,
    status: status,
    reason: reason,
    vp: vp,
    sender: newTx.sender,
    ts: newTx.ts,
    hash: newTx.hash,
    signature: newTx.signature
  }

  var data = fs.readFileSync('./db/blacklist.json');
  var users = JSON.parse(data);
  users.push(blacklist_db);
  fs.writeFile("./db/blacklist.json", JSON.stringify(users, null, 2), 'utf8', callback);
});

