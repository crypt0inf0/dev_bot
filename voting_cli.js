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
const list_url = 'http://167.172.173.164:3000/api/user/list';
const username = 'crypt0inf0';
const priv_key = '7q6Y8rUE5fjPtsgGgkhJGZMdyDyKnWetgWtxFyhCnfAa';

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
  
  autoComment(txData)
    // Blacklist
//     axios.get(blacklist_url).then(function (blacklist) {
//       for(let obj of blacklist.data) {
//         if (obj.user === txData.author){
//           downvote(txData)

//           break;            
//         }
//       }
//     })
    axios.get(list_url).then(function (list) {
      for(let obj of list.data) {
        if (obj.active == 'enable' && obj.username == txData.author && obj.status == 'blacklist'){
          min_vp = obj.min_vp;
          max_vp = obj.max_vp;
          downvote(txData)

          break;      
        }
      }
    })

    // Whitelist
    axios.get(list_url).then(function (list) {
      for(let obj of list.data) {
        if (obj.active == 'enable' && obj.username == txData.author && obj.status == 'whitelist'){
          min_vp = obj.min_vp;
          max_vp = obj.max_vp;
          upvote(txData)

          break;      
        }
      }
    })
  }
}

// Upvoting 
function upvote(txData){
  console.log('Upvoting...',  )
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
function downvote(txData){
  console.log('Downvoting...',  )
  try {
  // Get author of the post
  var author = txData.author;
  var permlink = txData.permlink;
  // vote power
//   var random_vp = Math.floor(Math.floor(Math.random() * 2048) - 2050); // Random num between -2-2050
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

// Commenting  
function autoComment(txData){
  console.log('Commenting...',  )
  try {
  // Get author of the post
  var author = txData.author;
  var permlink = txData.permlink;
  var comment = 'Welcome to dtube, Can you vote me as a leader on https://d.tube/#!/election Thanks ❤️'
  // Change vote power = 1000;
  var vp = 1500; // Math.floor(Math.random() * (max_vp - min_vp + 1) + min_vp); // Random VP between min & max
  var tag = '';
  // Broadcast vote to blockchain
  var newTx = {
    type: javalon.TransactionType.COMMENT,
    data: {
      pa: author,
      pp: permlink,
      json: {
//         app: 'onelovedtube/feedback',
        title: '',
        description: comment,
        refs: []
      },
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
