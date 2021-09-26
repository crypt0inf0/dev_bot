const mongoose = require('mongoose')

//schema
const Schema = mongoose.Schema;
//define the layout
const userDataSchema = new Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  username: {
      type: String,
      require: true
  },
  status: {
      type: String,
      require: true 
  },
  reason: {
      type: String,
      require: true
  },
  min_vp: {
      type: Number,
      require: true
  },
  max_vp: {
      type: Number,
      require: true
  },
  active: {
      type: String,
      require: true,
      default: 'enable'
  },
  sender: {
      type: String,
      require: true
      // default: 'crypt0inf0'
  },
  ts: {
      type: Number,
      require: true
  },
  hash: {
      type: String,
      require: true
  },
  signature: {
      type: String,
      require: true
  }
}, { versionKey: false, collection: 'user-data' })

//check user if exists before adding
userDataSchema.statics.isThisUserInUse = async function (username) {
  if (!username) throw new Error('Invalid username');
  try {
    const user = await this.findOne({ username });
    if (user) return false;

    return true;
  } catch (error) {
    console.log('error inside isThisUserInUse method', error.message);
    return false;
  }
}
//create model of layout to write data to db
const UserData = mongoose.model('UserData', userDataSchema)

module.exports = UserData
