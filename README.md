# Kickbot

This is a simple bot to trim your server down to people who actually pay attention to it, thus removing inactive members, this is better than just pruning your members as pruning only removes members that have been offline for `x` days, By Default the bot will not actually be able to kick anyone, this is disabled for security so you would be able to keep as many users as possible, to enable the kicking you need to un-comment `LINE 61`  

## Example .env File

```env
MONGO="<MongoDB Connection String>"
TOKEN="<Discord Bot Token>"
GUILD_ID="<Guild ID of your server>"
LOG_ID="<Channel to send logs to>"'
```