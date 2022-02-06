## Avalon bot's

#### Dependencies
* [MongoDB](https://mongodb.com)
* [NodeJS](https://nodejs.org/en/download/) **v12/14/16** (LTS)
* [Forever](https://www.npmjs.com/package/forever) sudo npm install forever -g
### Config
Update your details on `.env` file 

### Post
Every 60 seconds post script will fetch youtube channel info & parese for any new videos, If a new video found it will auto post it to dtube.

```
forever start post.js
```

### Up/Down Vote & Auto comment
This script will run every second to fetch any new video on avalon blockchain if so it will auto up/down vote & auto comment on every new videos.

```
forever start leader_vote_cli.js
```

### Claim rewards 
Every 3 minutes this script will check for any claimable reward available if so this script will auto claim that rewards.

```
forever start claim_rewards.js
```

