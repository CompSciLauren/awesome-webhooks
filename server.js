const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const port = 3000;

const fileToInspect = 'pom.xml';
const feature = '<enabled>true</enabled>';

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.post('/payload', async (req, res) => {
  switch (req.body.action) {
    case 'opened':
    case 'reopened':
    case 'synchronize':
      console.log('Pull request action: ' + req.body.action);
      const commitsUrl = req.body.pull_request.commits_url;
      const patchUrl = await axios
        .get(commitsUrl)
        .then(result => result.data[0])
        .then(pullRequest => pullRequest.url)
        .catch(error => {
          console.log(error);
        });

      const individualCommitsUrl = await axios
        .get(patchUrl)
        .then(result => result.data)
        .then(pullRequest => pullRequest.url)
        .catch(error => {
          console.log(error);
        });

      const chosenCommitUrl = await axios
        .get(individualCommitsUrl)
        .then(result => result.data)
        .then(pullRequest => {
          for (let i = 0; i < pullRequest.files.length; i++) {
            if (pullRequest.files[i].filename == fileToInspect) {
              return pullRequest.files[0].raw_url;
            }
          }
          return 'Error: ' + fileToInspect + ' file not found.';
        })
        .catch(error => {
          console.log(error);
        });

      const rawCodeUrl = await axios
        .get(chosenCommitUrl)
        .then(result => result.data)
        .then(pullRequest => {
          const isSnapshotEnabled = pullRequest.includes(feature);
          if (isSnapshotEnabled == true) {
            isSnapshotEnabled = 'feature exists';
          } else {
            isSnapshotEnabled = 'feature does not exist';
          }
          console.log(pullRequest);
          console.log('Feature status: ' + isSnapshotEnabled);
          return pullRequest;
        })
        .catch(error => {
          console.log(error);
        });
  }
  res.json({ hello: 'world' });
});

app.listen(port, () => console.log(`This app is listening on port ${port}!`));
