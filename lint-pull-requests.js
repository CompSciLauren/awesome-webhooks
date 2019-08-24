/**
 * How to use this webhook:
 * 1. Go to your project on GitHub > Settings > Webhooks & services > Add Webhook
 * 2. Payload URL: (https://....com/)
 * 3. Content type: `application/json`
 * 4. Secret: Leave blank
 * 5. Let me select individual events > Check `Pull Request`
 * 6. Add webhook and you are done.
 *
 * Next time a pull request is opened, a bot will comment on the linter status.
 */

let express = require('express');
let bodyParser = require('body-parser');

let app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

let port = 3000;

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.post('/payload', async (req, res) => {
  switch (req.body.action) {
    case 'opened':
      // lint
      commentOnPullRequest();
  }
  res.json({ hello: 'world' });
});

function commentOnPullRequest() {
  const privateToken = process.env.OAUTH_TOKEN;
  const projectId = process.env.CI_PROJECT_ID;
  const mergeRequestId = process.env.PR_ID;
  const message = `Message here.`;

  const path =
    'https://gitlab.com/api/v4/projects/' +
    projectId +
    '/merge_requests/' +
    mergeRequestId +
    '/notes?private_token=' +
    privateToken;
  request.post(path, { form: { body: message } });
}

app.listen(port, () => console.log(`This app is listening on port ${port}!`));
