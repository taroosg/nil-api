'use strict';

require('dotenv').config();
const git = require('simple-git');
const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors')
const proxy = require('http-proxy-middleware');
const bodyParser = require('body-parser')
const app = express();

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

const corsOptions = {
  origin: 'https://ggg-app.netlify.com',
  optionsSuccessStatus: 200
}
// const corsm = (req, res, next) => {
//   res.header('Access-Control-Allow-Origin', '*');
//   res.header('Access-Control-Allow-Methods', 'GET, POST');
//   res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
//   if (req.method === 'OPTIONS') {
//     res.status(200).send()
//   }

//   next();
// };


// const allowCrossDomain = (req, res, next) => {
//   res.header('Access-Control-Allow-Origin', '*')
//   res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE')
//   res.header(
//     'Access-Control-Allow-Headers',
//     'Content-Type, Authorization, access_token'
//   )
//   // intercept OPTIONS method
//   if ('OPTIONS' === req.method) {
//     res.send(200)
//   } else {
//     next()
//   }
// }
// app.use(allowCrossDomain)
app.use(cors())
// app.use(
//   '/api',
//   proxy({ target: 'https://ggg-app.netlify.com', changeOrigin: true })
// );

app.options('/api/v1/request', cors())
// app.post('/api/v1/request', cors(corsOptions), (req, res) => {
app.post('/api/v1/request', (req, res) => {
  console.log(req.headers)
  // if (
  // (req.headers.origin === 'https://ggg-app.netlify.com' && req.body.uid === 'ueMKNand78c9Yz2IvMgct22rnuj2')
  // || (req.headers.origin === 'http://localhost:3000' && req.body.uid === 'ueMKNand78c9Yz2IvMgct22rnuj2')
  // ) {
  console.log(req.body)
  // tweetPost(req.body.tweet);
  res.json(req.body);
  // } else {
  // res.send(400);
  // }
});

app.listen(8000, () => console.log('Listening on port 8000'));

// twitter設定
const Twitter = require('twitter');
const client = new Twitter({
  consumer_key: process.env.TWITTER_API_KEY,
  consumer_secret: process.env.TWITTER_API_SECRET_KEY,
  access_token_key: process.env.TWITTER_ACCESS_TOKEN,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
});

// tweet関数
const tweetPost = content => {
  client.post('statuses/update', { status: content }, function (error, tweet, response) {
    if (!error) {
      console.log("tweet success: " + content);
      createGrass(content.split('\n').join(''));
    } else {
      console.log(error);
    }
  });
}

// add commit push関数
const gitAddCommitPush = local_folder => {
  git(local_folder)
    .add('.')
    .commit('README.md updated.')
    .push(['-u', 'origin', 'master']);
}

// tweet内容をファイル追記→草生やす関数
const createGrass = tweet => {
  const local_folder = 'diary';
  const time = new Date();
  const position = 11;
  const file_path = `${local_folder}/README.md`;
  const new_text = `\n- ${time} ${tweet}\n`;

  fs.readFile(file_path, function read(err, data) {
    if (err) {
      throw err;
    }
    let file_content = data.toString();
    file_content = file_content.substring(position);
    const file = fs.openSync(file_path, 'r+');
    // const bufferedText = Buffer.alloc(Number(new_text + file_content));
    const bufferedText = new Buffer(new_text + file_content);
    fs.writeSync(file, bufferedText, 0, bufferedText.length, position);
    fs.close(file, (result) => {
      gitAddCommitPush(local_folder);
    });
  });
}

// ファイルの末尾に追記する方法
// fs.appendFile('diary/README.md', `\n${time}\n`, 'utf-8', (result) => {
//   gitAddCommitPush(local_folder);
// });

// 最初にやるときだけ実行
// const git_url = 'https://github.com/taroosg/git_diary.git';
// const dirname = path.dirname('./' + local_folder);
// fs.access(dirname, fs.constants.R_OK | fs.constants.W_OK, (err) => {
//   if (err) {
//     //. clone
//     git().clone(git_url, local_folder);
//   } else {
//     //. pull
//     git(local_folder).pull();
//   }
// });
