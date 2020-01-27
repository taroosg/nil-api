const git = require('simple-git');
const fs = require('fs');
const path = require('path');

const git_url = 'https://github.com/taroosg/git_diary.git';
const local_folder = 'diary';

const time = new Date();

const position = 11;
const file_path = `${local_folder}/README.md`;
const new_text = `\n${time}\n`;

// fs.appendFile('diary/README.md', `\n${time}\n`, 'utf-8', (result) => {
//   gitAddCommitPush();
// });

const gitAddCommitPush = local_folder => {
  git(local_folder)
    .add('.')
    .commit('README.md updated.')
    .push(['-u', 'origin', 'master']);
}

fs.readFile(file_path, function read(err, data) {
  if (err) {
    throw err;
  }
  let file_content = data.toString();
  file_content = file_content.substring(position);
  const file = fs.openSync(file_path, 'r+');
  const bufferedText = Buffer.alloc(Number(new_text + file_content));
  fs.writeSync(file, bufferedText, 0, bufferedText.length, position);
  fs.close(file, (result) => {
    gitAddCommitPush(local_folder);
  });
});

//. フォルダの存在確認
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
