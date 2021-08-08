const javalon = require('javalon')
const cb = (err, res) => console.log("Error: ", err, "Result: ", res)

const username = ''
const priv_key = ''


javalon.getDiscussionsByAuthor(process.argv[2], null, null, (err, contents) => {
    // console.log(err, contents)
    var content_count = Object.keys(contents).length;
    
    for (i = 0; i < content_count; i++) {
    let author = contents[i].author
    let permlink = contents[i].link
    let vp = -250 // Change vp | Math.floor(Math.floor(Math.random() * 2048) - 2050); // Random num between -2-2050
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