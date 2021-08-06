const path = require('path')
const dotenv = require('dotenv')
const axios = require('axios')
const AvalonStreamer = require('./components/avalonStreamer')
const javalon = require('javalon')

dotenv.config({ path: '.env'})
const cb = (err, res) => console.log("Error: ", err, "Result: ", res)

// const api_url = process.env.API_URL;
// const blacklist_url = process.env.BLACKLIST_URL;
// const username = process.env.USERNAME;
// const priv_key = process.env.PRIV_KEY;

const api_url = 'https://avalon.d.tube';
const blacklist_url = 'https://avalonblacklist.nannal.com/status/black';
const username = 'dtube';
const priv_key = '34EpMEDFJwKbxaF7FhhLyEe3AhpM4dwHMLVfs4JyRto5';


// Check user voting power & bandwidth
axios.get(api_url + '/accounts/' + username).then((user_data) => {
user_vp = user_data.data[0].vt.v;
user_bw = user_data.data[0].bw.v;
console.log(user_vp)
if (user_vp >= 5000 && user_bw >= 5000){
// stream
let streamer = new AvalonStreamer(api_url)
streamer.streamBlocks((newBlock) => {
  let txData = {
    type: newBlock.txs[0].type,
    content: newBlock.txs[0].data,
    author: newBlock.txs[0].sender,
    permlink: newBlock.txs[0].data.link
  }
  let includePosts = checkBlockForContents(txData)
    if (includePosts) {
      console.log('POST FOUND: ', txData)
    }
});

function checkBlockForContents(txData) {
  // Calculate json length to eliminate comments
  var jsonObject = txData.content;
  var keyCount  = Object.keys(jsonObject).length;
  // check if tnx contain contents. If type = 4, your account will vote on post.
  if(txData.type == 4 && keyCount == 4) { // ie. keyCount = 4 {post} | keyCount = 6 {comment}
    
    // Blacklist
    axios.get(blacklist_url).then(function (blacklist) {
      for(let obj of blacklist.data) {
        if (obj.user === txData.author){
          downvote(txData)

          break;            
        }
      }
    })

    // Whitelist
    var whitelist = require('./db/whitelist.json')
    for(let obj of whitelist) {
      if (obj.user === txData.author){
        vote_vp = obj.vp;
        upvote(txData)
        
        break;            
      }
    }
  }
}

// Upvoting 
async function upvote(txData){
  console.log('Upvoting...',  )
  try {
  // Get author of the post
  var author = txData.author;
  var permlink = txData.permlink;
  // Change vote power = 1000;
  var vp = vote_vp;
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

// Downvoting
async function downvote(txData){
  console.log('Downvoting...',  )
  try {
  // Get author of the post
  var author = txData.author;
  var permlink = txData.permlink;
  // Change vote power = 1000;
  var vp = -201;
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

} else {
  console.log('You dont have enough voting power/bandwidth');
}

});