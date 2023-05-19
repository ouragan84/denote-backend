// === IMPORTS ===


const express = require('express');
const app = express();
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');
const { default: mongoose } = require('mongoose');
const userSchema = require('./user');


// === CONFIG ===


require('dotenv').config();

app.set('view engine', 'ejs');
app.use(bodyParser.json());

// make any unhandled exceptions not crash the app
process.on('uncaughtException', function (err) {
    console.log('fatal error abborted');
    console.log(err);
});


// === HANDLE USER ACTIONS ===


// handle new user registration
app.post('/register', async (req, res) => {
    const platform = req.body.platform;
    const timeCreated = Date.now()

    const user = new userSchema({
        platform: platform,
        timeCreated: timeCreated,
        events: [
            {
                time: timeCreated,
                type: 'register',
                aditionalData: ""
            }
        ],
        email: "",
        name: "",
        lastTimeOpened: timeCreated,
        timesUsedAI: 0,
        bannedAI: false,
        timeUnbannedAI: null,
        isPaid: false,
        timePaymentExpires: null
    });

    await user.save();

    console.log('new user registered: ' + user._id)

    res.send({userID: user._id});
});

// handle user opening the app
app.post('/event', async (req, res) => {
    const userID = req.body.userID;
    const time = Date.now();
    const type = req.body.type;
    const aditionalData = req.body.aditionalData;

    // get user from DB (if it doesn't exist, send error)
    // findById no longer works with a callback
    const user = await userSchema.findById(userID);
    if(!user){
        return res.send({error: 'user not found'});
    }

    user.events.push({
        time: time,
        type: type,
        aditionalData: aditionalData
    });

    user.lastTimeOpened = time;

    // save user
    user.save();
});

// handle user requesting to pay
app.post('/payment-request', async (req, res) => {
    const userID = req.body.userID;
    const time = Date.now();
    const email = req.body.email;

    const user = await userSchema.findById(userID);
    if(!user){
        return res.send({error: 'user not found'});
    }

    user.email = email;

    // update user
    user.events.push({
        time: time,
        type: 'payment_request',
        aditionalData: 'email: ' + email
    });

    // save user
    user.save();

    notifyAdmins('Payment request from ' + email + ' (user: ' + userID + ')');

    return res.send({status: 'ok'});
});

// get aggregate data for all users, using our password
app.post('/data', async (req, res) => {
    if(req.body.password !== process.env.PASSWORD){
        return res.status(400).send({error: 'wrong password'});
    }

    const allUsers = await userSchema.find({});
    const data = {
        totalUsers: allUsers.length,
        totalPaidUsers: allUsers.filter((user) => user.isPaid).length,
        totalBannedUsers: allUsers.filter((user) => user.bannedAI).length,
        totalUnbannedUsers: allUsers.filter((user) => !user.bannedAI).length,
        totalUsersUsingAI: allUsers.filter((user) => user.timesUsedAI > 0).length,
        totalUsersUsingAIInLastHour: allUsers.filter((user) => user.timesUsedAI > 0 && user.lastTimeOpened > Date.now() - 60*60*1000).length,
        totalUsersUsingAIInLast24Hours: allUsers.filter((user) => user.timesUsedAI > 0 && user.lastTimeOpened > Date.now() - 24*60*60*1000).length,
        totalUsersUsingAIInLast7Days: allUsers.filter((user) => user.timesUsedAI > 0 && user.lastTimeOpened > Date.now() - 7*24*60*60*1000).length,
        totalUsersUsingAIInLast30Days: allUsers.filter((user) => user.timesUsedAI > 0 && user.lastTimeOpened > Date.now() - 30*24*60*60*1000).length,
        totalUsersActiveInLastHour: allUsers.filter((user) => user.lastTimeOpened > Date.now() - 60*60*1000).length,
        totalUsersActiveInLast24Hours: allUsers.filter((user) => user.lastTimeOpened > Date.now() - 24*60*60*1000).length,
        totalUsersActiveInLast7Days: allUsers.filter((user) => user.lastTimeOpened > Date.now() - 7*24*60*60*1000).length,
        totalUsersActiveInLast30Days: allUsers.filter((user) => user.lastTimeOpened > Date.now() - 30*24*60*60*1000).length,
        users: allUsers
    }

    res.send(data);
});

// ban a user from using the AI for set time, using our password
app.post('/ban', async (req, res) => {
    if(req.body.password !== process.env.PASSWORD){
        return res.status(400).send({error: 'wrong password'});
    }

    const userID = req.body.userID;
    const time = Date.now();
    const timeToBan = req.body.timeToBan; // in days
    const timeUnbannedAI = new Date(time + timeToBan*24*60*60*1000);

    const user = await userSchema.findById(userID);
    if(!user){
        return res.send({error: 'user not found'});
    }

    // update user
    user.bannedAI = true;
    user.timeUnbannedAI = timeUnbannedAI;

    user.save();

    return res.send({status: 'ok'});
});

// unban a user from using the AI, using our password
app.post('/unban', async (req, res) => {
    if(req.body.password !== process.env.PASSWORD){
        return res.status(400).send({error: 'wrong password'});
    }

    if(req.body.password !== process.env.PASSWORD){
        return res.status(400).send({error: 'wrong password'});
    }

    const userID = req.body.userID;

    const user = await userSchema.findById(userID);
    
    if(!user){
        return res.send({error: 'user not found'});
    }

    // update user
    user.bannedAI = false;
    user.timeUnbannedAI = Date.now();

    user.save();

    return res.send({status: 'ok'});
});

// set a user as paid, using our password
app.post('/set-paid', async (req, res) => {
    if(req.body.password !== process.env.PASSWORD){
        return res.status(400).send({error: 'wrong password'});
    }
});

// set a user as unpaid, using our password
app.post('/set-unpaid', async (req, res) => {
    if(req.body.password !== process.env.PASSWORD){
        return res.status(400).send({error: 'wrong password'});
    }
});


// === AI API ===


const OPEN_AI_KEY = process.env.OPEN_AI_KEY;

const getBody = (initial, prompt, question) => {
    return {
        "model": "gpt-3.5-turbo",
        "messages": [
            {role: 'system', content: initial},
            {role: 'system', content: prompt},
            {role: 'user', content: question}
        ]
    }
} 

const readFile = (name) => {
    const filepath = path.join(__dirname, 'GPT', name);
    return new Promise((resolve, reject) => {
        fs.readFile(filepath, 'utf8', (err, data) => {
            if(err) reject(err);
            else resolve(data);
        });
    });
}

const callGPT = async (promptTitle, question) => {

    const initial = await readFile('Initial.txt');
    const prompt = await readFile(promptTitle + '.txt');

    return fetch("https://api.openai.com/v1/chat/completions", 
    {
        method: "POST",
        headers: {
            "Authorization": "Bearer " + OPEN_AI_KEY,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(getBody(initial, prompt, question))
    }).then((data) => {
        return data.json();
    }).then((data) => {
        return data.choices[0];
    });
}

// TODO: add authorization and ai-token counting
app.post('/ai/:promptTitle', async (req, res) => {
    const promptTitle = req.params.promptTitle;
    const userID = req.body.userID;


    const user = await userSchema.findById(userID);
    if(!user){
        return res.send({error: 'user not found'});
    }

    // chec k if user is banned
    if(user.bannedAI){
        return res.send({error: 'user banned'});
    }

    // update user
    user.lastTimeOpened = Date.now();
    user.timesUsedAI += 1;
    user.events.push({
        time: Date.now(),
        type: 'ai_request',
        aditionalData: promptTitle,
    });

    // save user
    user.save();

    // console.log(req.body)
    const question = req.body.question;

    const response = await callGPT(promptTitle, question);
    // console.log('response', response);
    res.send(response);
});


// === SERVING STATIC FILES ===


// set the static files location /public/img will be /img for users
app.use(express.static(path.join(__dirname, 'public'))); 

// send our index.html file to the user for the home page
app.get('/', function(req, res) {
    res.render('home', {url: process.env.URL, version: process.env.VERSION});
});

app.get('/about', function(req, res) {
    res.render('about', {url: process.env.URL});
});



// === ADMIN NOTIFICATIONS ===


const notifyAdmins = (message) => {
    console.log('notify admins: ' + message);
}


// === MONGO DB and START SERVER ===

const DB_URL = `mongodb+srv://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_URL}/${process.env.DB_NAME}?retryWrites=true&w=majority`;
    
const connectDB = async () => {
    mongoose.set('strictQuery', false);
    try{
        await mongoose.connect(DB_URL, {});
    }catch (err){
        console.error(err);
    }
}

// connect DB
connectDB();

// start listening for connections
mongoose.connection.once('open', () => {
    console.log('🌿 Connected to mongoDB')
    const httpServer = app.listen(process.env.PORT, ()=>{
        console.log('🚀 Server started at ' + process.env.URL);

    });
})