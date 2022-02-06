const javalon = require('javalon')
const cb = (err, res) => console.log("Error: ", err, "Result: ", res)

const username = process.env.USERNAME;
const priv_key = process.env.PRIV_KEY;

function intervalFunc() {
	claimReward();
}setInterval(intervalFunc, 180000); // 3 minutes

function claimReward() {
	javalon.getClaimableVotesByAccount(username, 0, (err, votes) => {
    	// console.log(err, votes)
		if (votes.length == '0'){
		  return;
		} else{
			author = votes[0].author
			link = votes[0].link
		}
		
		post();
		
	})
}

function post() {
	// Broadcast vote to blockchain
	try{
		var newTx = {
				type: javalon.TransactionType.CLAIM_REWARD,
				data: {
					author: author,
					link: link
				}
		}
    // Sign transaction
    newTx = javalon.sign(priv_key, username, newTx)
    // console.log(newTx)
    // Send transaction to blockchain
    javalon.sendTransaction(newTx, function(err, res) {
      cb(err, res)
    })
	} catch (error) {
    	console.error(error);
  }
}
