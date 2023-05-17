// basic server in node.js with express, serves static html files from public folder

// load the express module
const express = require('express');
const app = express();
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');

require('dotenv').config();

app.set('view engine', 'ejs');
app.use(bodyParser.json());


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
    console.log('Prompt: ' + promptTitle);


    console.log(req.body )
    const question = req.body.question;

    // q: why is req.body undefined?
    // a: https://stackoverflow.com/questions/38306569/express-bodyparser-req-body-undefined



    const response = await callGPT(promptTitle, question);
    console.log('response', response);
    res.send(response);
});

// set the static files location /public/img will be /img for users
app.use(express.static(path.join(__dirname, 'public'))); 

// send our index.html file to the user for the home page
app.get('/', function(req, res) {
    res.render('home', {url: process.env.URL, version: process.env.VERSION});
});

app.listen(process.env.PORT, () => {
    console.log('Our app is running on http://localhost:' + process.env.PORT);
});
