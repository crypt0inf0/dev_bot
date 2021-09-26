const express = require('express')
const route = express.Router()
const UserData = require('../modules/User')

const javalon = require('javalon')
const axios = require('axios')

const baseURL = 'https://avalon.d.tube/accounts/'
const alice_key = 'E1cf4uXccgNgFwPTErdW8Ur2NXkEx71Ly1GBKQ3ah8UU'

// GET home page
route.get('/', (req, res) => {
    UserData.find().then(function (doc) {
        res.render('index', { users: doc })
    })
})

route.get('/api/user/list', (req, res) => {
    UserData.find().then(user => {
        res.send(user)
    })
})
  
route.get('/add', (req, res) => {
    res.render('add')
})
  
route.post('/addUser', async (req, res) => {
    // check if user exists
    const isNewUser = await UserData.isThisUserInUse(req.body.username)
    if (!isNewUser)
        return res.json({
        success: false,
        message: 'This user already exists, try edit',
        })
    // fetch user data 
    async function fetchData() {
        try {
        const response = await axios.get(baseURL + req.body.username)
        return response.data
        }catch(err) {
            console.log(err)
        }
    }
    const account = await fetchData()
    // console.log(account[0].name)

    // sign user
    var newTx = {
        type: javalon.TransactionType.NEW_ACCOUNT,
        data: {
            _id: account[0]._id,
            user: account[0].name,
            status: req.body.status,
            reason: req.body.reason,
            min_vp: req.body.min_vp,
            max_vp: req.body.max_vp
        }
    }
    
    newTx = javalon.sign(alice_key, 'dtube', newTx)
    // console.log(newTx)
    const user = {
         _id: newTx.data._id,
        username: newTx.data.user,
        status:  newTx.data.status,
        reason:  newTx.data.reason,
        min_vp:  newTx.data.min_vp,
        max_vp:  newTx.data.max_vp,
        sender:  newTx.sender,
        ts: newTx.ts,
        hash: newTx.hash,
        signature: newTx.signature
    }
    const data = new UserData(user)
        // console.log(data)
        data.save((err, data) => {
            if (err) throw err
            res.redirect('/')
        })
})
  
route.post('/search', (req, res) => { // This post request filters out our documents based on the input and renders the results
    const search = req.body.search.toLowerCase()
    UserData.find({}, (err, data) => {
        const filteredList = data.filter(user => {
            const username = user.username.toLowerCase()
            return username == search
        })
    res.render('index', { users: filteredList })
    })
})
  

let sort = false
route.get('/sort', (req, res) => {
  function ascend(a, b) {
    // This function sorts the users alphabetically in descending order
    const userA = a.status
    const userB = b.status

    let comparison = 0
    if (userA > userB) {
      comparison = 1
    } else if (userA < userB) {
      comparison = 1
    }
    return comparison
  }
  function descend(a, b) {
    // This function sorts the users alphabetically in descending order
    const userA = a.status
    const userB = b.status

    let comparison = 0
    if (userA > userB) {
      comparison = -1
    } else if (userA < userB) {
      comparison = -1
    }
    return comparison
  }
  if (!sort) {
    UserData.find({}, (err, data) => {
      let sorted = data.sort(ascend)
      res.render('index', { users: sorted })
    })
    sort = true
  } else {
    UserData.find({}, (err, data) => {
      let sorted = data.sort(descend)
      res.render('index', { users: sorted })
    })
    sort = false
  }
})

route.get('/edit/:id', (req, res) => {
    // console.log('THIS IS WAT PARAMS ARE BEING PASSED' + req.params.id.substr(3))
    UserData.findOne({ username: req.params.id.substr(3) }, (err, data) => {
      // console.log('THIS IS THE FRIKIN DATA' + data)
      res.render('edit', { user: data })
    })
})

route.post('/edit/:id', (req, res) => {
    console.log(req.body)
    const user = {
        username: req.body.username,
        status: req.body.status,
        reason: req.body.reason,
        min_vp: req.body.min_vp,
        max_vp: req.body.max_vp,
		    active: req.body.active
    }
    UserData.findOne({ username: user.username }, (err, doc) => {
        if (err) {
            console.log('error, no entry found')
            throw err
        }
        // doc.username = user.username
        doc.status = user.status
        doc.reason = user.reason
        doc.min_vp = user.min_vp
        doc.max_vp = user.max_vp
		    doc.active = user.active
        doc.save((err, data) => {
            if (err) throw err
            res.redirect('/')
        })
    })
})
  
route.post('/delete/:id', (req, res) => {
    const username = req.params.id
    // console.log(username)
    UserData.findOneAndDelete({ username: username }, (err, data) => {
        if (err) throw err
        console.log(`User removed: ${data}`)
        res.redirect('/')
    })
})

module.exports = route
  