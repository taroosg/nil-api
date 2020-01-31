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

app.use(cors())

app.get('/api/v1/grass', (req, res) => {
  if (
    // 自分のところだけ許可
    req.headers.origin === process.env.ORIGIN && req.query.uid === process.env.UID
  ) {
    res.json(getGrass(grassUrl));
  } else {
    res.send(400);
  }
})

app.post('/api/v1/request', (req, res) => {
  console.log(req.headers)
  if (
    // 自分のところだけ許可
    req.headers.origin === process.env.ORIGIN && req.body.uid === process.env.UID
  ) {
    console.log(req.body)
    // tweetPost(req.body.tweet);
    // const responseData = {
    //   grass: getGrass(grassUrl),
    //   req: req.body
    // }
    res.json(req.body);
  } else {
    res.send(400);
  }
});

app.listen(process.env.PORT, () => console.log(`Listening on port ${process.env.PORT}`));

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
    .add('.', result => { `add: ${console.log(result)}` })
    .commit('README.md updated.', result => { `commit: ${console.log(result)}` })
    .push(['-u', 'origin', 'master'], result => { `push: ${console.log(result)}` });
}

// tweet内容をファイル追記→草生やす関数
const createGrass = tweet => {
  const local_folder = 'nil';
  const time = new Date(Date.now() + ((new Date().getTimezoneOffset() + (9 * 60)) * 60 * 1000));
  const position = 23;
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

// 草取得関数
const request = require('sync-request');

const grassUrl = process.env.GRASS_URL;

const getGrass = url => {
  const response = request('GET', url);
  // var grass = response.body.toString().match(/<svg(?: [\s\S]+?)?>[\s\S]*?<\/svg>/g);
  const grassElement = response.body.toString().match(/<rect(?: [\s\S]+?)?\/>/g);
  const grassArray = grassElement.map(x => {
    return { data_date: x.split(' ')[8].slice(11, 21), data_count: Number(x.split(' ')[7].split('"').join('').slice(11)) }
  });
  return grassArray;
}
// console.log(getGrass(grassUrl))

// ファイルの末尾に追記する方法
// fs.appendFile('diary/README.md', `\n${time}\n`, 'utf-8', (result) => {
//   gitAddCommitPush(local_folder);
// });

// 最初にやるときだけ実行
// const git_url = 'git@github.com:taroosg/nil.git';
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
