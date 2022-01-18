const dotenv = require('dotenv')
const javalon = require('javalon')
const youtubedl = require('youtube-dl')
const { getChannelFeed } = require('@obg-lab/youtube-channel-feed');

dotenv.config( { path: '.env'} )
const cb = (err, res) => console.log("Error: ", err, "Result: ", res)

const username = process.env.USERNAME;
const priv_key = process.env.PRIV_KEY;

// Get channel id by finding "externalId" on page source
const channel_id = 'UCXuqSBlHAE6Xw-yeJA0Tunw';
const options = ['--username=user', '--password=hunter2']

validateData(); 

// Get youtube channel feed
async function getYoutubefeed() {
	try {
		const feed = await getChannelFeed(channel_id)
		return feed
	} catch (error) {
		console.log(error);
	}
}

// Get latest video id
async function getVideoid() {
	let channel_feed = await getYoutubefeed();
	let video_id = channel_feed.feed.entry[0].id[0].split(':')[2];
	return video_id
}

// Validate data
async function validateData() {
	try{
		let video_id = await getVideoid();
		// console.log(video_id)
		
		// Check video id against the new video id
		javalon.getDiscussionsByAuthor('clipbytes01', null, null, (err, contents) => {
			let dtube_id = contents[0].json.files.youtube;
			if (video_id === dtube_id) {
				console.log("No new video found")
				return
			} else {
				// Grab video info & post function
                		getVideoinfo()
            		}
        	})
    } catch (error) {
		console.log(error);
	}
}

async function getVideoinfo() {
	let video_id = await getVideoid();
	let url = 'https://youtu.be/' + video_id;
	// Grab youtube video info
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
