const dotenv = require('dotenv')
const fs = require('fs')
const javalon = require('javalon')
const youtubedl = require('youtube-dl')
const { getChannelFeed } = require('@obg-lab/youtube-channel-feed');

dotenv.config( { path: '.env'} )
const cb = (err, res) => console.log("Error: ", err, "Result: ", res)

const username = process.env.USERNAME;
const priv_key = process.env.PRIV_KEY;

const channel_id = 'UCXuqSBlHAE6Xw-yeJA0Tunw';
const options = ['--username=user', '--password=hunter2']

validateData(); 

// get youtube channel feed
async function getFeed() {
	try {
		const feed = await getChannelFeed(channel_id)
		return feed
	} catch (error) {
		console.log(error);
	}
}

// Get latest video id
async function getVideoid() {
	let channel_feed = await getFeed();
	let video_id = channel_feed.feed.entry[0].id[0].split(':')[2];
	return video_id
}

// validate data against local db
async function validateData() {
	try{
		const video_id = await getVideoid();
		// console.log(video_id)
		
		// Check video id against the new video id
		var youtubeId = require('./db/youtube.json')
		for(let obj of youtubeId) {
			if (obj.id === video_id){
	    		console.log("No new video found.")    
				break;            
    		}else {
                console.log("New video found.")
                // Wait 1 1 sec before validatiting data from db
		        // await new Promise(resolve => setTimeout(resolve, 1000));
		
		        // Write data into local db
		        var youtube_data = {
    		        id: video_id
  		        };
		
                var data = [ youtube_data ];
                fs.writeFile("./db/youtube.json", JSON.stringify(data, 'utf8', 4), (err) => {
                    if (err) {  console.error(err);  return; };
                        console.log("Updating DB...");
                });
                
                //Grab video info & post function
                getVideoinfo()
            }
        }
    } catch (error) {
		console.log(error);
	}
}

async function getVideoinfo() {
	let video_id = await getVideoid();
	let url = 'https://youtu.be/' + video_id;

	youtubedl.getInfo(url, options, function(err, info) {
		if (err) throw err

		const youtube_id = info.id;
		const title = info.title;
		const description = info.description;
		const duration = info._duration_raw;
		const tag = '';

		autoPost()

		// posting
		function autoPost() {
			console.log('Posting...', )
			try {
				var vp = Math.floor(Math.floor(Math.random() * 1500) + 500); // Random num between 500-1500
				// var tag = '';
				// Generate random link
				function generatePermlink() {
					let permlink = ""
					let possible = "abcdefghijklmnopqrstuvwxyz0123456789"
					for (let i = 0; i < 8; i++)
						permlink += possible.charAt(Math.floor(Math.random() * possible.length))
					return permlink
				}
				var postLink = generatePermlink()
				console.log(postLink)
				// Broadcast vote to blockchain
				var newTx = {
					type: javalon.TransactionType.COMMENT,
					data: {
						link: postLink,
						json: {
							files: {
								youtube: youtube_id
							},
							title: title,
							desc: description,
							dur: duration,
							tag: tag,
							refs: []
						},
						vt: vp,
						tag: tag
					}
				}
				// Sign transaction
				newTx = javalon.sign(priv_key, username, newTx)
				// console.log(newTx)
				// Send transaction to blockchain
				javalon.sendRawTransaction(newTx, function(err, res) {
				    cb(err, res)
				})
			} catch (error) {
				console.error(error);
			}
		}
	})
}
