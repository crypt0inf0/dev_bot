const dotenv = require('dotenv')
const javalon = require('javalon')

dotenv.config({ path: '.env'})
const cb = (err, res) => console.log("Error: ", err, "Result: ", res)

transfer()

// Transfer DTC 
function transfer(){
    console.log('Sending...',  )
    try {
    // User who you want to send some DTC
    var receiver = '';
    var amount = 100; // 100 is equal to 1 DTC
    var memo = '';
    // Broadcast vote to blockchain
    var newTx = {
      type: javalon.TransactionType.TRANSFER,
      data: {
        receiver: receiver,
        amount: amount,
        memo: memo
      }
    }
    // Sign transaction
    newTx = javalon.sign(priv_key, username, newTx)
    // Send transaction to blockchain
    javalon.sendRawTransaction(newTx, function(err, res) {
        cb(err, res)
    })
    } catch (error) {
      console.error(error);
    }
}
