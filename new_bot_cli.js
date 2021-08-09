const fs = require('fs')
const javalon = require('javalon')
const callback = (err) => { if (err) { throw err; } console.log("Updated...") };
const cb = (err, res) => console.log("Error: ", err, "Result: ", res)


const username = ''
const priv_key = ''

// Generata random username
let r = (Math.random() + 1).toString(36).substring(2);
let r1 = (Math.random() + 1).toString(36).substring(2);
let r2 = (Math.random() + 1).toString(36).substring(2);
var newUser = r + '-' + r1 + '-' + r2
// console.log(newUser);

// Generate avalon pub/priv key
var key = javalon.keypair();
var newUser_pub = key.pub;
var newUser_priv = key.priv;
// console.log(newUser_pub, newUser_priv)

// Store generated data
var newUser_db = {
    username: newUser,
    pub: newUser_pub,
    priv: newUser_priv
  }

var data = fs.readFileSync('./db/bots.json');
var usernames= JSON.parse(data);
usernames.push(newUser_db);
fs.writeFile("./db/bots.json", JSON.stringify(usernames), 'utf8', callback);

setTimeout( getBots, 3000) // 3 sec

// Fetch data from db
function getBots() {
    var bots = require('./db/bots.json')
    for(let obj of bots) {
        var user = obj.username;
        var pub = obj.pub;
    }

    // Broadcast new user to blockchain
    var newTx = {
        type: javalon.TransactionType.NEW_ACCOUNT,
        data: {
            name: user,
            pub: pub
        }
    }
    // Sign transaction
    newTx = javalon.sign(priv_key, username, newTx)
    // console.log(newTx)
    // Send transaction to blockchain
    javalon.sendTransaction(newTx, function(err, res) {
        cb(err, res)
    })
}
