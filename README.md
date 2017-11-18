# lanodized
A Discord chat bot created to help manage LAN parties.

## Quick Start
Using [Vagrant](https://www.vagrantup.com/downloads.html) with [VirtualBox](https://www.virtualbox.org/wiki/Downloads) is the easiest way to run `lanodized` locally, for development and testing purposes. Once installed on your machine, run `vagrant up` from the root of this project to create your environment.

Before you launch the bot, [register a Discord App](https://discordapp.com/developers/applications/me) and add a Bot User to get your API token, which you should put in the chat config file.

```bash
cp config/chat.json.example config/chat.json
```

Double-check that all your database config settings are correct, and start the contraption.

```bash
vagrant ssh
cd /opt/lanodized
npm start
```

### Connecting to your Discord server
Once you've got the bot running, add it to your Discord guild using the Client ID on the page for your Discord App. Until the full OAuth2 flow is implemented, this will have to do.

If you would like to change the permissions being granted, you can use [this handy calculator](https://discordapi.com/permissions.html). The bot currently requires:
- Read Messages
- Send Messages
- Manage Messages (requires 2FA)
- Add Reactions

<https://discordapp.com/api/oauth2/authorize?scope=bot&permissions=11328&client_id=CLIENT_ID>