const fs = require('fs')
const dotenv = require('dotenv')
const javalon = require('javalon')
const youtubedl = require('youtube-dl')
const { getChannelFeed } = require('@obg-lab/youtube-channel-feed')

dotenv.config( { path: '.env'} )
const cb = (err, res) => console.log("Error: ", err, "Result: ", res)

const username = process.env.USERNAME;
const priv_key = process.env.PRIV_KEY;

const channel_id = 'UCDR8cvjALazMm2j9hOar8_g';
const options = ['--username=user', '--password=hunter2']

function intervalFunc() {
	validate()
}setInterval(intervalFunc, 60000);


async function validate() {
	// Fetch youtube feed
	const channel_feed = await getChannelFeed(channel_id)
	video_id = await channel_feed.feed.entry[0].id[0].split(':')[2];

	// Check video id's against the new video id
	var data = fs.readFileSync('./db/youtube.json');
	var ids = JSON.parse(data);
				
	var youtube_data = {
		id: video_id
	}
	
	// Validate & add data
	function addDb(youtube_data) {
  		var index = ids.findIndex(o => o.id === video_id)
  		if (index === -1) {
			post()
			console.log("New video found.")
			ids.push(youtube_data);
			fs.writeFileSync("./db/youtube.json", JSON.stringify(ids, null, 2), 'utf8'), (err) => {
				if (err) {  console.error(err);  return; };
					console.log("Updating DB...");
				}
		}else {
			console.log("Video already exists" + " " + video_id)
		}
	}
	addDb(youtube_data);
}


function post() {
        //Grab video info & post function
        let url = 'https://youtu.be/' + video_id;

        youtubedl.getInfo(url, options, function(err, info) {
                if (err) throw err

                youtube_id = info.id;
                title = info.title;
                description = info.description;
                duration = info._duration_raw;
                tag = 'promo';

                autoPost()
        })
}

// posting
function autoPost() {
        console.log('Posting...', )
        console.log(youtube_id)
        try {
	        var vp = Math.floor(Math.floor(Math.random() * 50) + 50); // Random num between 500-1500
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
                //console.log(postLink)
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
