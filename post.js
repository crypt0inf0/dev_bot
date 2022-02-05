const fs = require('fs')
const axios = require('axios')
const dotenv = require('dotenv')
const javalon = require('javalon')
const youtubedl = require('youtube-dl')
const { getChannelFeed } = require('@obg-lab/youtube-channel-feed')

dotenv.config( { path: '.env'} )
const cb = (err, res) => console.log("Error: ", err, "Result: ", res)

const api_url = 'https://avalon.d.tube';

const username = process.env.USERNAME;
const priv_key = process.env.PRIV_KEY;

const channel_id = 'UCXuqSBlHAE6Xw-yeJA0Tunw';
const options = ['--username=user', '--password=hunter2']

function intervalFunc() {
	// Check VP
	axios.get(api_url + '/accounts/' + username).then((user_data) => {
		var user_vp = user_data.data[0].vt.v;
		// var user_bw = user_data.data[0].bw.v
		// console.log(user_vp)
		
		if(user_vp > 5000){ // Required VP amount ie. 5000 VP
			validate()
		} else{
			return;
		}
	})
}setInterval(intervalFunc, 60000);


async function validate() {
	// Fetch youtube feed
	const channel_feed = await getChannelFeed(channel_id)
	let channel_author = await (channel_feed.feed.author[0].name).toString().toLowerCase();
	video_id = await channel_feed.feed.entry[0].id[0].split(':')[2];

	// Check video id's against the new video id
	let channel_name = (channel_author.replace(/[^A-Za-z0-9 ]/g, ``).trim()).replace(/ /g,"_");
	// console.log(channel_name)
	
	let db_dir = './db/youtube/' + channel_name + '.json';
	// console.log(db_dir)
	
	// Create json file if not exists
	if (!fs.existsSync(db_dir)){
   		fs.writeFileSync(db_dir, `[{"id": "UK1hL4k8Zao"}]`); // dummy data
	}
	
	var data = fs.readFileSync(db_dir);
	var ids = JSON.parse(data);
				
	var youtube_data = {
		id: video_id
	}
				
	function addDb(youtube_data) {
  		var index = ids.findIndex(o => o.id === video_id)
  		if (index === -1) {
			post()
			console.log("New video found.")
			ids.push(youtube_data);
			fs.writeFileSync(db_dir, JSON.stringify(ids, null, 2), 'utf8'), (err) => {
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
