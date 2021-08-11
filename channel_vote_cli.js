const javalon = require('javalon')
const yargs = require("yargs")

const cb = (err, res) => console.log("Error: ", err, "Result: ", res)

const options = yargs
  .usage("Usage: -u <username> -t <tag (optional)> -m <minimum vp> -x <maximum vp>")
  .option("u", { alias: "username", describe: "dtube username", type: "string", demandOption: true })
  .option("t", { alias: "tag", describe: "tag your vote", type: "string" })
  .option('m', { alias: "min_vp", describe: "minimum vp to vote", default: "100", type: "number", demandOption: true })
  .option('x', { alias: "max_vp", describe: "maximum vp to vote", default: "1000", type: "number", demandOption: true })
.argv;

const username = ''
const priv_key = ''


javalon.getDiscussionsByAuthor(options.username, null, null, (err, contents) => {
    // console.log(err, contents)
    var content_count = Object.keys(contents).length;
    
    for (i = 0; i < content_count; i++) {
    let author = contents[i].author
    let permlink = contents[i].link
    let vp = Math.floor(Math.random() * (options.max_vp - options.min_vp + 1) + options.min_vp) // | vp = 246
    let tag = ''
    
    var newTx = {
        type: javalon.TransactionType.VOTE,
        data: {
            author: author,
            link: permlink,
            vt: vp,
            tag: tag
        }
      }
    // console.log(newTx)
    newTx = javalon.sign(priv_key, username, newTx)
    
    javalon.sendTransaction(newTx, function(err, res) {
        cb(err, res)
    })
    }
});