import * as dotenv from "dotenv";
dotenv.config({ path: __dirname + "/.env" });

import { Client, EmbedBuilder, GatewayIntentBits, Partials } from "discord.js"
import DBLoader from "./db/db";
import mongoose from "mongoose";

const client = new Client({
    intents: [
        GatewayIntentBits.AutoModerationConfiguration,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildMessageTyping,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageTyping,
    ],
    partials: [
        Partials.Channel,
        Partials.Message,
        Partials.GuildMember,
        Partials.User,
        Partials.Reaction,
    ]
})

async function sleep(time: number) {
    return new Promise((resolve) => setTimeout(resolve, time || 1000))
}
mongoose.connect(process.env.MONGO || "").then(() => {
    new DBLoader().loadModels().then((db) => {
        client.once("ready", () => console.log("Bot Online"))
        client.on("messageCreate", async (message) => {
            if (message.content === "kick-inflation-reduction") {
                if (!message.member?.permissions.has("Administrator")) return
                let data = await db.user.get({})
                data = data.map((d: any) => d?.id)
                let members = (await message.guild?.members?.fetch())?.filter(m => !m.user.bot)?.filter(m => m.kickable)?.toJSON().map(m => m.id)

                console.log(data, members?.length)

                members = members?.filter((m) => !data.includes(m))

                message.channel.send(`Kicking ${members?.length} members`)
                const guild = await client.guilds.fetch(process.env.GUILD_ID || "")
                const channel = await guild.channels.fetch(process.env.LOG_ID || "")
                if (channel?.isTextBased()) {
                    guild.members.fetch()
                    channel.send(`Kicking ${members?.length} Members at intervals of 5s per member to avoid API spam`)
                    for (let i = 0; i < (members?.length || 0); i++) {
                        if (typeof members === "undefined") return
                        const id = members[i] || ""
                        let member = await guild.members.cache.get(members[i])
                        await sleep(5000)
                        channel.send(`Kicked ${members[i]} (${member?.user.tag}) (Testing, Not actually kicking)`)
                        // member?.kick().catch(() => channel.send(`Failed to Kick ${member?.user.username}`))
                    }
                }

            }
            if (message.content === "init-infaltion-reduction") {
                message.delete()
                message.channel.send({
                    content: "@everyone",
                    embeds: [
                        new EmbedBuilder()
                            .setColor("Red")
                            .setTitle("Gumcatopia Inflation Reduction Act (IRA) 2023")
                            .setDescription("<t:1677214800:R>, this server will be scaling down to become a smaller, tighter-knit community. As such, we will be purging inactive members. **Click the button below** and your account will be added to the whitelist, and therefore you will not get booted.")

                    ],
                    components: [
                        {
                            type: 1, components: [{
                                type: 2,
                                style: 3,
                                label: "Opt Out",
                                customId: `NOINFLATIONREDUCTION`
                            },]
                        }
                    ]
                })
            }
        })
        client.on("interactionCreate", async (interaction) => {
            if (interaction.isButton()) {
                if (interaction.customId === "NOINFLATIONREDUCTION") {
                    const user = await db.user.getOne({ id: interaction.user.id })
                    if (user) {
                        interaction.reply({
                            ephemeral: true,
                            embeds: [
                                new EmbedBuilder().setColor("Yellow").setTitle("Already Opted Out").setDescription("You have already Opted out of the Inflation Reduction Act")
                            ]
                        })
                        return
                    }
                    console.log(`${interaction.user?.id} (${interaction.user.tag}) has opted out of the inflation reduction act`)
                    db.user.create({ id: interaction.user.id })
                    interaction.user.send({
                        embeds: [
                            new EmbedBuilder()
                                .setColor("Green")
                                .setTitle("Inflation Reduction Act")
                                .setDescription("You have opted out of the inflation reduction act, you will not be affected when this bill gets passed")
                        ]
                    })
                    const guild = await client.guilds.fetch(process.env.GUILD_ID || "")
                    const channel = await guild.channels.fetch(process.env.LOG_ID || "")
                    if (channel?.isTextBased()) {
                        channel.send(`${interaction.user.toString()} (${interaction.user.tag}) has Opted Out of the inflation reduction act`)
                    }
                    interaction.reply({
                        ephemeral: true,
                        embeds: [
                            new EmbedBuilder().setColor("Green").setDescription("✅")
                        ]
                    })
                }
            }
        })

        client.login(process.env.TOKEN || "")
    })
});