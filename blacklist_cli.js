const javalon = require('javalon')
const fs = require('fs')
const yargs = require("yargs")

const callback = (err) => { if (err) { throw err; } console.log("Updated...") };

const options = yargs
  .usage("Usage: -u <username> -r <reason> -m <minimum vp> -x <maximum vp>")
  .option("u", { alias: "username", describe: "dtube username", type: "string", demandOption: true })
  .option("r", { alias: "reason", describe: "reason for blacklist", default: "sperm", type: "string", demandOption: true })
  .option('m', { alias: "min_vp", describe: "minimum vp to vote", default: "100", type: "number", demandOption: true })
  .option('x', { alias: "max_vp", describe: "maximum vp to vote", default: "1000", type: "number", demandOption: true })
.argv;

const username = '';
const priv_key = '';

javalon.getAccounts([options.username], (err, accounts) => {
  // console.log(err, accounts)
  let _id = accounts[0]._id
  let user = accounts[0].name
  let status = 'blacklist'
  let reason = options.reason
  // let vp = 20 // change vp accoding to the user
  let min_vp = options.min_vp
  let max_vp = options.max_vp

  var newTx = {
    type: javalon.TransactionType.NEW_ACCOUNT,
    data: {
        _id: _id,
        user: user,
        status: status,
        reason: reason,
        // vp: vp
    }
  }
  
  newTx = javalon.sign(priv_key, username, newTx)

  var blacklist_db = {
    _id: _id,
    username: user,
    status: status,
    reason: reason,
    // vp: vp,
    min_vp: min_vp,
    max_vp: max_vp,
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

