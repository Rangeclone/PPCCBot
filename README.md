# ROBLOX Management bot for PPCC

This bot is used to communicate across the bloxlink, roblox and noblox API for access to group administration features such as ranking and group shouts.

If you plan on using this bot for your own use, you must make a config.json file containing the following:

```json
{
    "token": "YOURTOEKN",
    "clientID": "BOTCLIENTID",
    "status": {
        "type": "WATCHING",
        "text": "STATUS",
        "online": "online"
    },
    "groups": {
        "GUILDID": [GROUPID,"ROBLOX COOKIE"],
    }
}
```