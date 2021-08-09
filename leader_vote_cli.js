const javalon = require('javalon')
const cb = (err, res) => console.log("Error: ", err, "Result: ", res)


// Fetch data from db
var bots = require('./db/bots.json')
var user_count = Object.keys(bots).length;
for (i = 0; i < user_count; i++) {
let username = bots[i].username
let priv_key = bots[i].priv

// Broadcast vote to blockchain
var newTx = {
    type: javalon.TransactionType.APPROVE_NODE_OWNER, // DISAPROVE_NODE_OWNER
    data: {
        target: process.argv[2]
    }
}
// Sign transaction
newTx = javalon.sign(priv_key, username, newTx)
console.log(newTx)
// Send transaction to blockchain
javalon.sendTransaction(newTx, function(err, res) {
    cb(err, res)
})
}

