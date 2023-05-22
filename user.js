const mongoose = require('mongoose')
const Schema = mongoose.Schema

const userSchema = new Schema({
    email:{
        type: String,
    },
    name:{
        ttype: String,
    },
    lastTimeOpened:{
        type: Date,
    },
    events: [
        {
            time: {
                type: Date,
            },
            type: {
                type: String,
            },
            aditionalData: {
                type: String
            }
        }
    ],
    timeCreated: {
        type: Date,
    },
    timesUsedAI: {
        type: Number,
        default: 0
    },
    platform: {
        type: String,
        required: true
    },
    timeUnbannedAI: {
        type: Date,
        default: null
    },
    bannedAI: {
        type: Boolean,
        default: false
    },
    isPaid: {
        type: Boolean,
        default: false
    },
    timePaymentExpires: {
        type: Date,
        default: null
    },
    computerID:{
        type: String,
        default: ''
    },
    homedir:{
        type: String,
        homedir: ''
    }
})

module.exports = mongoose.model('DenoteBetaUser', userSchema)