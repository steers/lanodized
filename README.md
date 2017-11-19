```
_/\/\____________/\/\______/\/\____/\/\____________________/\/\__/\/\__________________________________/\/\_
_/\/\__________/\/\/\/\____/\/\/\__/\/\____/\/\/\__________/\/\__________/\/\/\/\/\____/\/\/\__________/\/\_
_/\/\________/\/\____/\/\__/\/\/\/\/\/\__/\/\__/\/\____/\/\/\/\__/\/\________/\/\____/\/\/\/\/\____/\/\/\/\_
_/\/\________/\/\/\/\/\/\__/\/\__/\/\/\__/\/\__/\/\__/\/\__/\/\__/\/\______/\/\______/\/\________/\/\__/\/\_
_/\/\/\/\/\__/\/\____/\/\__/\/\____/\/\____/\/\/\______/\/\/\/\__/\/\/\__/\/\/\/\/\____/\/\/\/\____/\/\/\/\_
____________________________________________________________________________________________________________
```

A Discord chat bot created to help manage LAN parties.

## Quick Start
Using [Vagrant](https://www.vagrantup.com/downloads.html) with [VirtualBox](https://www.virtualbox.org/wiki/Downloads) is the easiest way to run `lanodized` locally, for development and testing purposes. Install both on your machine.

Before you launch the bot, [register a Discord App](https://discordapp.com/developers/applications/me) and add a Bot User to get your API token, which you should put in the chat config file.

```bash
cp config/chat.json.example config/chat.json
editor config/chat.json
```

If you already have a PostgreSQL database set up that you would like to use, make sure to add the appropriate details to the database config file.

```bash
cp config/database.json.example config/database.json
editor config/database.json
```

With everything installed and configured, run `vagrant up` from the somewhere in this project structure to create your VM and start the bot.

### Connecting to your Discord server
Once you've got the bot running, add it to your Discord guild using the Client ID on the page for your Discord App. Until the full OAuth2 flow is implemented, this will have to do.

If you would like to change the permissions being granted, you can use [this handy calculator](https://discordapi.com/permissions.html). The bot currently requires:
- Read Messages
- Send Messages
- Manage Messages (requires 2FA)
- Add Reactions

<https://discordapp.com/api/oauth2/authorize?scope=bot&permissions=11328&client_id=CLIENT_ID>