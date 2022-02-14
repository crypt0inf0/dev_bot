const axios = require('axios')

module.exports = class {
    constructor(api,irreversible) {
        this.headBlock = 0
        this.unparsedBlocks = 0
        this.fetchingBlock = false
        this.api = api
    }

    streamBlocks (cb) {
        // Stream blocks
        setInterval(() => {
            axios.get(this.api + '/count').then((bHeight) => {
                if (bHeight.data.count > this.headBlock)
                    if (this.headBlock == 0) 
                        this.headBlock = bHeight.data.count
                    else
                        this.unparsedBlocks = bHeight.data.count - this.headBlock
            }).catch(() => {})
        },1500)
    
        setInterval(() => {
            if (this.unparsedBlocks > 0 && !this.fetchingBlock) {
                this.fetchingBlock = true
                axios.get(this.api + '/block/' + (this.headBlock+1)).then((newBlock) => {
                    this.headBlock++
                    this.unparsedBlocks--
                    setTimeout(() => this.fetchingBlock = false,500)
                    cb(newBlock.data)
                }).catch(() => this.fetchingBlock = false)
            }
        },500)
    }

    streamTransactions(cb) {
        this.streamBlocks(newBlock)
    }
}
