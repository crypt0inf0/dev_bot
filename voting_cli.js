const dotenv = require('dotenv');
const axios = require('axios');
const AvalonStreamer = require('./components/avalonStreamer');
const javalon = require('javalon');

dotenv.config({ path: '.env'});
const cb = (err, res) => console.log("Error: ", err, "Result: ", res);

const apis = [
	'https://avalon.tibfox.com',
    'https://avalon.d.tube',
    'https://dtube.club/mainnetapi',
    // 'https://avalon.oneloved.tube',
    'https://dtube.fso.ovh'
]

const api_url = process.env.API_URL;
const blacklist_url = process.env.BLACKLIST_URL;
const user_list_url = process.env.USER_LIST_URL;
const username = process.env.USERNAME;
const priv_key = process.env.PRIV_KEY;

const min_user_vp = process.env.MIN_USER_VP;
const min_user_bw = process.env.MIN_USER_BW;

// const api_url = 'https://avalon.d.tube';
// const blacklist_url = 'https://avalonblacklist.nannal.com/status/black';
// const user_list_url = 'http://167.172.173.164:3000/api/user/list';
// const username = 'crypt0inf0';
// const priv_key = '7q6Y8rUE5fjPtsgGgkhJGZMdyDyKnWetgWtxFyhCnfAa';

// Check voting power & bandwidth
// function intervalFunc() {
//         // Check user voting power & bandwidth
//        javalon.getAccount(username, (err, account) => {
// 	       let user_vp = javalon.votingPower(account);
// // 	       let user_bw = javalon.bandwidth(account);
// // 	       console.log(user_vp);
	       
// 	       if (user_vp > min_user_vp) {
// 		       avalonStream();
//                 } else {
//                        console.log('You dont have enough voting power/bandwidth');
//                        return;
//                 }
// 	})
// }
// setInterval(intervalFunc, 1000); // 1 sec

// Check voting power & bandwidth
function checkBalance(i) {
    setTimeout(() => {
		axios.get(apis[i] + '/accounts/' + username).then((user_data) => {
			// VP & BW gets updated only on every new txs
			var user_vp = user_data.data[0].vt.v;
			var user_bw = user_data.data[0].bw.v;
			// console.log(user_vp);
			
			if (user_vp > min_user_vp && user_bw > min_user_bw) {
				clearInterval(streamer);
			} else {
				console.log("You don't have enough voting power/bandwidth");
				return;
			}
		}).catch(e => {console.error(e)})
		
		if(i >= apis.length - 1){
			checkBalance(0)
		}else {
			checkBalance(++i);
		}
    }, 60 * 1000); // 1 min
}

checkBalance(0);

// Avalon stream
var streamer = new AvalonStreamer(api_url);
streamer.streamBlocks((newBlock) => {
	let txData = {
		type: newBlock.txs[0].type,
		content: newBlock.txs[0].data,
		author: newBlock.txs[0].sender,
		permlink: newBlock.txs[0].data.link
	}

	checkBlockForContents(txData);
});


function checkBlockForContents(txData) {
	// Calculate json length to eliminate comments
	let jsonObject = txData.content;
	let keyCount = Object.keys(jsonObject).length;
	// Check if tnx contain contents. If type = 4, your account will vote on post.
	if (txData.type == 4 && keyCount == 4) { // ie. keyCount = 4 {post} | keyCount = 6 {comment}

		// Blacklist
		// axios.get(blacklist_url).then(function (blacklist) {
		//   for(let obj of blacklist.data) {
		//     if (obj.user === txData.author){
		//       downvote(txData)

		//       break;            
		//     }
		//   }
		// })
		
		// Fetch white/black list users from api	
		axios.get(user_list_url).then((list) => {
			for (let obj of list.data) {
				if (obj.active == 'enable' && obj.username == txData.author && obj.status == 'blacklist') {
					min_vp = obj.min_vp;
					max_vp = obj.max_vp;
					downvote(txData);

					break;
				}else if (obj.active == 'enable' && obj.username == txData.author && obj.status == 'whitelist') {
					min_vp = obj.min_vp;
					max_vp = obj.max_vp;
					upvote(txData);

					break;
				}
			}
		}).catch((e) => {console.error(e)});

		// Auto comment
		javalon.getContent(txData.author, txData.permlink, (err, post) => {
			//console.log(post)
			if (post.child.filter(comment => comment[0] === username).length > 0) {
				console.log("already commented");
			} else {
				autoComment(txData);
			}
		})
	}
}

// Upvoting 
function upvote(txData) {
	console.log('Upvoting...', );
	try {
		// Get author of the post
		var author = txData.author;
		var permlink = txData.permlink;
		// Change vote power = 1000;
		var vp = Math.floor(Math.random() * (max_vp - min_vp + 1) + min_vp); // Random VP between min & max
		var tag = '';
		// Broadcast vote to blockchain
		var newTx = {
			type: javalon.TransactionType.VOTE,
			data: {
				author: author,
				link: permlink,
				vt: vp,
				tag: tag
			}
		};
		// Sign transaction
		newTx = javalon.sign(priv_key, username, newTx);
		// Send transaction to blockchain
		javalon.sendRawTransaction(newTx, function(err, res) {
			cb(err, res)
		});
	} catch (error) {
		console.error(error);
	}
}

// Downvoting
function downvote(txData) {
	console.log('Downvoting...', );
	try {
		// Get author of the post
		var author = txData.author;
		var permlink = txData.permlink;
		// vote power
		// var random_vp = Math.floor(Math.floor(Math.random() * 2048) - 2050); // Random num between -2-2050
		var vp = Math.floor(Math.random() * (min_vp - max_vp + 1) - min_vp); // Random VP between min & max
		var tag = '';
		// Broadcast vote to blockchain
		var newTx = {
			type: javalon.TransactionType.VOTE,
			data: {
				author: author,
				link: permlink,
				vt: vp,
				tag: tag
			}
		};
		// Sign transaction
		newTx = javalon.sign(priv_key, username, newTx);
		// Send transaction to blockchain
		javalon.sendRawTransaction(newTx, function(err, res) {
			cb(err, res)
		});
	} catch (error) {
		console.error(error);
	}
}

// Commenting  
function autoComment(txData) {
	console.log('Commenting...', );
	try {
		// Get author of the post
		var author = txData.author;
		var permlink = txData.permlink;
		var comment = '\nWelcome to dtube, Can you vote me as a leader on https://d.tube/#!/election Thanks ❤️\n'
		// Change vote power = 1000;
		var vp = Math.floor(Math.floor(Math.random() * 1500) + 500); // Random num between 500-1500
		var tag = '';
		// Generate random link
		function generatePermlink() {
			let permlink = "";
			let possible = "abcdefghijklmnopqrstuvwxyz0123456789"
			for (let i = 0; i < 8; i++)
				permlink += possible.charAt(Math.floor(Math.random() * possible.length))
			return permlink;
		}
		var commentLink = generatePermlink();
		// console.log(commentLink)
		// Broadcast vote to blockchain
		var newTx = {
			type: javalon.TransactionType.COMMENT,
			data: {
				link: commentLink,
				pa: author,
				pp: permlink,
				json: {
					// app: 'onelovedtube/feedback',
					title: '',
					description: comment,
					refs: []
				},
				vt: vp,
				tag: tag
			}
		};
		// Sign transaction
		newTx = javalon.sign(priv_key, username, newTx);
		// Send transaction to blockchain
		javalon.sendRawTransaction(newTx, function(err, res) {
			cb(err, res)
		});
	} catch (error) {
		console.error(error);
	}
}
