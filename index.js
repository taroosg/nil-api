const git = require('simple-git');
const fs = require('fs');
const path = require('path');

const git_url = 'https://github.com/taroosg/git_diary.git';
const local_folder = 'diary';

//. フォルダの存在確認
const dirname = path.dirname('./' + local_folder);
fs.access(dirname, fs.constants.R_OK | fs.constants.W_OK, (err) => {
  if (err) {
    //. clone
    git().clone(git_url, local_folder);
  } else {
    //. pull
    git(local_folder).pull();
  }
});

const time = new Date();

fs.appendFile('diary/README.md', `\n${time}`, 'utf-8', (result) => {
  gitAddCommitPush();
});

const gitAddCommitPush = () => {
  git(local_folder)
    .add('.')
    .commit('README.md updated.')
    .push(['-u', 'origin', 'master']);
}
