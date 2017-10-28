# lanodized
A Discord chat bot created to help manage LAN parties.

## Quick Start
You'll need `postgresql` v9.6+ and `node` v8.0+ installed.

```bash
npm install
cp config/database.json.example config/database.json
cp config/chat.json.example config/chat.json
```

Add the appropriate database and Discord configuration, then apply migrations and boot it up!

```bash
npm run bootstrap
npm start
```

### Connecting to your Discord server
Once you've got the bot running, add it to your Discord guild using the Client ID. Eventually I plan on adding OAuth2, but for now this is fine for testing.
<https://discordapp.com/api/oauth2/authorize?client_id=:clientId&scope=bot&permissions=87514177>