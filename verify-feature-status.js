let express = require('express');
let bodyParser = require('body-parser');
let axios = require('axios');

let app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

let port = 3000;

let fileToInspect = 'pom.xml';
let feature = '<enabled>true</enabled>';

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.post('/payload', async (req, res) => {
  switch (req.body.action) {
    case 'opened':
    case 'closed':
    case 'reopened':
    case 'synchronize':
      console.log('Pull request action: ' + req.body.action);
      let commitsUrl = req.body.pull_request.commits_url;
      let patchUrl = await axios
        .get(commitsUrl)
        .then(result => result.data[0])
        .then(pullRequest => {
          console.log('patchUrl: ' + pullRequest.url);
          return pullRequest.url;
        })
        .catch(error => {
          console.log('patchUrl Error: ' + error);
        });

      let individualCommitsUrl = await axios
        .get(patchUrl)
        .then(result => result.data)
        .then(pullRequest => {
          console.log('individualCommitsUrl: ' + pullRequest.url);
          return pullRequest.url;
        })
        .catch(error => {
          console.log('individualCommitsUrl Error: ' + error);
        });

      let chosenCommitUrl = await axios
        .get(individualCommitsUrl)
        .then(result => result.data)
        .then(pullRequest => {
          for (let i = 0; i < pullRequest.files.length; i++) {
            if (pullRequest.files[i].filename == fileToInspect) {
              console.log('chosenCommitUrl: ' + pullRequest.files[0].raw_url);
              return pullRequest.files[0].raw_url;
            }
          }
          return (
            'Error: ' +
            fileToInspect +
            ' file not found.' +
            pullRequest.files[0].raw_url
          );
        })
        .catch(error => {
          console.log(error);
        });

      let rawCodeUrl = await axios
        .get(chosenCommitUrl)
        .then(result => result.data)
        .then(pullRequest => {
          let isSnapshotEnabled = pullRequest.includes(feature);
          if (isSnapshotEnabled == true) {
            isSnapshotEnabled = 'feature exists';
          } else {
            isSnapshotEnabled = 'feature does not exist';
          }
          console.log('//////////////////////////////////////////////////////');
          console.log('Pull Request: \n' + pullRequest);
          console.log('//////////////////////////////////////////////////////');
          console.log('Feature status: ' + isSnapshotEnabled);
          return pullRequest;
        })
        .catch(error => {
          console.log('Error: ' + error);
        });
  }
  res.json({ hello: 'world' });
});

app.listen(port, () => console.log(`This app is listening on port ${port}!`));
