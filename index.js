const { 
    Client, 
    GatewayIntentBits, 
    REST, 
    Routes, 
    SlashCommandBuilder, 
    EmbedBuilder, 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle,
    MessageFlags 
} = require('discord.js');

const TOKEN = process.env.BOT_TOKEN || 'BOT_TOKEN';
const CLIENT_ID = process.env.CLIENT_ID || 'CLIENT_ID';

const commands = [
    new SlashCommandBuilder()
        .setName('cat')
        .setDescription('Holt ein zufälliges Catgirl-Bild')
        .addBooleanOption(option => 
            option.setName('hidden')
                  .setDescription('Soll das Bild nur für dich sichtbar sein?')
                  .setRequired(false)
        ),
    new SlashCommandBuilder()
        .setName('waifu')
        .setDescription('Holt ein zufälliges Anime-Bild')
        .addStringOption(option =>
            option.setName('tag')
                  .setDescription('Wähle eine Kategorie aus')
                  .setRequired(false)
                  .addChoices(
                      { name: '🌸 Waifu', value: 'waifu' },
                      { name: '🐾 Neko', value: 'neko' },
                      { name: '🦊 Fox Girl', value: 'fox_girl' }
                  )
        )
        .addBooleanOption(option => 
            option.setName('hidden')
                  .setDescription('Soll das Bild nur für dich sichtbar sein?')
                  .setRequired(false)
        ),
    new SlashCommandBuilder()
        .setName('male')
        .setDescription('Holt ein zufälliges Anime-Boy-Bild')
        .addBooleanOption(option => 
            option.setName('hidden')
                  .setDescription('Soll das Bild nur für dich sichtbar sein?')
                  .setRequired(false)
        ),
    new SlashCommandBuilder()
        .setName('tsundere')
        .setDescription('Holt ein Tsundere-Bild und Spruch (Zufällig oder mit Tag)')
        .addStringOption(option =>
            option.setName('tag')
                  .setDescription('Wähle eine Emotion aus')
                  .setRequired(false)
                  .addChoices(
                      { name: '😳 Blush', value: 'blush' },
                      { name: '💢 Pout (Schmollen)', value: 'pout' },
                      { name: '😤 Angry', value: 'angry' },
                      { name: '😏 Smug', value: 'smug' }
                  )
        )
        .addBooleanOption(option => 
            option.setName('hidden')
                  .setDescription('Soll das Bild nur für dich sichtbar sein?')
                  .setRequired(false)
        ),
    new SlashCommandBuilder()
        .setName('mcstatus')
        .setDescription('Zeigt den Live-Status deines Minecraft-Servers an')
        .addStringOption(option =>
            option.setName('ip')
                  .setDescription('Server IP oder Domain (Beispiel: mc.zenbyte.indevs.in)')
                  .setRequired(false)
        )
        .addBooleanOption(option =>
            option.setName('show_ip')
                  .setDescription('Soll die Server-IP im Embed angezeigt werden?')
                  .setRequired(false)
        )
        .addBooleanOption(option => 
            option.setName('hidden')
                  .setDescription('Soll die Nachricht nur für dich sichtbar sein?')
                  .setRequired(false)
        ),
    new SlashCommandBuilder()
        .setName('discordpfp')
        .setDescription('Zeigt das Profilbild und den Banner eines Discord-Nutzers an')
        .addUserOption(option =>
            option.setName('target')
                  .setDescription('Der Nutzer, dessen Profil du sehen willst')
                  .setRequired(false)
        )
        .addBooleanOption(option =>
            option.setName('hidden')
                  .setDescription('Soll die Nachricht nur für dich sichtbar sein?')
                  .setRequired(false)
        )
].map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(TOKEN);

const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

// Function für Catgirl (Nekosia API)
async function createCatPayload() {
    const response = await fetch('https://api.nekosia.cat/api/v1/images/catgirl');
    if (!response.ok) throw new Error(`HTTP Error ${response.status}`);

    const json = await response.json();
    const imageUrl = json?.image?.original?.url;

    if (!imageUrl) return null;

    const embed = new EmbedBuilder()
        .setTitle('🐱 Hier ist dein Catgirl-Bild!')
        .setImage(imageUrl)
        .setColor(0x9b59b6);

    const button = new ButtonBuilder()
        .setCustomId('reload_cat')
        .setLabel('🔄 Neues Bild')
        .setStyle(ButtonStyle.Primary);

    const row = new ActionRowBuilder().addComponents(button);

    return { embeds: [embed], components: [row] };
}

// Function für Waifu (Nekos.life API)
async function createWaifuPayload(tag = 'waifu') {
    let endpoint = 'waifu';
    if (tag === 'neko') endpoint = 'neko';
    if (tag === 'fox_girl') endpoint = 'fox_girl';

    const response = await fetch(`https://nekos.life/api/v2/img/${endpoint}`);
    if (!response.ok) throw new Error(`HTTP Error ${response.status}`);

    const json = await response.json();
    const imageUrl = json?.url;

    if (!imageUrl) return null;

    const formattedTag = tag.charAt(0).toUpperCase() + tag.slice(1);

    const embed = new EmbedBuilder()
        .setTitle(`✨ Hier ist dein ${formattedTag}-Bild!`)
        .setImage(imageUrl)
        .setColor(0xff75a0);

    const button = new ButtonBuilder()
        .setCustomId(`reload_waifu_${tag}`)
        .setLabel('🔄 Neues Bild')
        .setStyle(ButtonStyle.Primary);

    const row = new ActionRowBuilder().addComponents(button);

    return { embeds: [embed], components: [row] };
}

// Function für Male / Husbando (Nekos.best API)
async function createMalePayload() {
    const response = await fetch('https://nekos.best/api/v2/husbando');
    if (!response.ok) throw new Error(`HTTP Error ${response.status}`);

    const json = await response.json();
    const item = json?.results?.[0];
    const imageUrl = item?.url;
    const artistName = item?.artist_name;

    if (!imageUrl) return null;

    const embed = new EmbedBuilder()
        .setTitle('💙 Hier ist dein Anime-Boy-Bild!')
        .setImage(imageUrl)
        .setColor(0x3498db);

    if (artistName) {
        embed.setFooter({ text: `Künstler: ${artistName}` });
    }

    const button = new ButtonBuilder()
        .setCustomId('reload_male')
        .setLabel('🔄 Neues Bild')
        .setStyle(ButtonStyle.Primary);

    const row = new ActionRowBuilder().addComponents(button);

    return { embeds: [embed], components: [row] };
}

// Function für Tsundere (Nekos.best API mit Emotionen)
async function createTsunderePayload(tag = null) {
    const validTags = ['blush', 'pout', 'angry', 'smug'];
    let selectedTag = tag;

    if (!validTags.includes(selectedTag)) {
        selectedTag = validTags[Math.floor(Math.random() * validTags.length)];
    }

    const response = await fetch(`https://nekos.best/api/v2/${selectedTag}`);
    if (!response.ok) throw new Error(`HTTP Error ${response.status}`);

    const json = await response.json();
    const item = json?.results?.[0];
    const imageUrl = item?.url;

    if (!imageUrl) return null;

    const quotes = {
        blush: "W-Was starrst du mich so an?! Das bedeutet gar nichts, Baka!",
        pout: "Hmpf! Red nicht mit mir... Es ist absolut nicht so, als wäre ich sauer auf dich!",
        angry: "Kannst du mich bitte in Ruhe lassen?! Du gehst mir total auf die Nerven!",
        smug: "Heh... Sieht so aus, als wärst du komplett aufgeschmissen ohne meine Hilfe, oder?"
    };

    const tagTitles = {
        blush: "😳 Blush",
        pout: "💢 Pout (Schmollen)",
        angry: "😤 Angry",
        smug: "😏 Smug"
    };

    const embed = new EmbedBuilder()
        .setTitle(`💗 Tsundere Modus [${tagTitles[selectedTag]}]`)
        .setDescription(`*„${quotes[selectedTag]}”*`)
        .setImage(imageUrl)
        .setColor(0xe84393)
        .setFooter({ text: `Kategorie: ${selectedTag}` });

    const button = new ButtonBuilder()
        .setCustomId(`reload_tsundere_${tag || 'random'}`)
        .setLabel('🔄 Neues Bild')
        .setStyle(ButtonStyle.Primary);

    const row = new ActionRowBuilder().addComponents(button);

    return { embeds: [embed], components: [row] };
}

// Function für Minecraft Server Status
async function createMcStatusPayload(targetIp = 'mc.zenbyte.indevs.in', showIp = true) {
    const response = await fetch(`https://api.mcsrvstat.us/3/${targetIp}`);
    if (!response.ok) throw new Error(`HTTP Error ${response.status}`);

    const data = await response.json();

    const embed = new EmbedBuilder()
        .setTimestamp();

    if (!data.online) {
        embed.setTitle('🔴 Minecraft Server Status')
             .setColor(0xe74c3c)
             .setDescription(`Der Server **${targetIp}** ist aktuell offline oder nicht erreichbar.`);
        
        return { embeds: [embed] };
    }

    const motdText = data.motd?.clean ? data.motd.clean.join('\n') : 'Keine MOTD verfügbar';
    const version = data.version || 'Unbekannt';
    const onlinePlayers = data.players?.online ?? 0;
    const maxPlayers = data.players?.max ?? 0;
    const iconUrl = `https://api.mcsrvstat.us/icon/${targetIp}`;

    embed.setTitle('🟢 Minecraft Server Status')
         .setColor(0x2ecc71)
         .setThumbnail(iconUrl)
         .addFields(
             { name: '🌐 Server IP', value: showIp ? `\`${targetIp}\`` : '||*Versteckt*||', inline: true },
             { name: '📦 Version', value: `\`${version}\``, inline: true },
             { name: '👥 Spieler', value: `\`${onlinePlayers} / ${maxPlayers}\``, inline: true },
             { name: '💬 MOTD', value: `\`\`\`${motdText}\`\`\``, inline: false }
         )
         .setFooter({ text: 'KuroX Minecraft Status' });

    const button = new ButtonBuilder()
        .setCustomId(`reload_mcstatus_${targetIp}_${showIp}`)
        .setLabel('🔄 Aktualisieren')
        .setStyle(ButtonStyle.Secondary);

    const row = new ActionRowBuilder().addComponents(button);

    return { embeds: [embed], components: [row] };
}

client.once('ready', async () => {
    console.log(`Eingeloggt als ${client.user.tag}!`);

    try {
        await rest.put(
            Routes.applicationCommands(CLIENT_ID),
            { body: commands }
        );
        console.log('Slash-Commands erfolgreich registriert!');
    } catch (error) {
        console.error('Fehler beim Registrieren:', error);
    }
});

client.on('interactionCreate', async interaction => {
    if (interaction.isChatInputCommand()) {
        const isHidden = interaction.options.getBoolean('hidden') || false;
        const replyOptions = isHidden ? { flags: MessageFlags.Ephemeral } : {};

        if (interaction.commandName === 'cat') {
            await interaction.deferReply(replyOptions);
            try {
                const payload = await createCatPayload();
                if (!payload) return interaction.editReply({ content: 'Kein Bild gefunden.' });
                await interaction.editReply(payload);
            } catch (err) {
                console.error('Cat Error:', err.message);
                await interaction.editReply({ content: 'Fehler beim Laden des Catgirl-Bildes.' });
            }
        }

        if (interaction.commandName === 'waifu') {
            const selectedTag = interaction.options.getString('tag') || 'waifu';

            await interaction.deferReply(replyOptions);
            try {
                const payload = await createWaifuPayload(selectedTag);
                if (!payload) return interaction.editReply({ content: 'Kein Bild gefunden.' });
                await interaction.editReply(payload);
            } catch (err) {
                console.error('Waifu API Error:', err.message);
                await interaction.editReply({ content: 'Fehler beim Laden des Bildes.' });
            }
        }

        if (interaction.commandName === 'male') {
            await interaction.deferReply(replyOptions);
            try {
                const payload = await createMalePayload();
                if (!payload) return interaction.editReply({ content: 'Kein Bild gefunden.' });
                await interaction.editReply(payload);
            } catch (err) {
                console.error('Male Error:', err.message);
                await interaction.editReply({ content: 'Fehler beim Laden des Anime-Boy-Bildes.' });
            }
        }

        if (interaction.commandName === 'tsundere') {
            const selectedTag = interaction.options.getString('tag');

            await interaction.deferReply(replyOptions);
            try {
                const payload = await createTsunderePayload(selectedTag);
                if (!payload) return interaction.editReply({ content: 'Kein Bild gefunden.' });
                await interaction.editReply(payload);
            } catch (err) {
                console.error('Tsundere Error:', err.message);
                await interaction.editReply({ content: 'Fehler beim Laden des Tsundere-Bildes.' });
            }
        }

        if (interaction.commandName === 'mcstatus') {
            const ip = interaction.options.getString('ip') || 'mc.zenbyte.indevs.in';
            const showIp = interaction.options.getBoolean('show_ip') ?? true;

            await interaction.deferReply(replyOptions);
            try {
                const payload = await createMcStatusPayload(ip, showIp);
                await interaction.editReply(payload);
            } catch (err) {
                console.error('MC Status Error:', err.message);
                await interaction.editReply({ content: 'Fehler beim Abrufen des Server-Status.' });
            }
        }

        if (interaction.commandName === 'discordpfp') {
            const targetUser = interaction.options.getUser('target') || interaction.user;

            await interaction.deferReply(replyOptions);
            try {
                const fetchedUser = await client.users.fetch(targetUser.id, { force: true });
                
                const avatarUrl = fetchedUser.displayAvatarURL({ size: 1024, extension: 'png', forceStatic: false });
                const bannerUrl = fetchedUser.bannerURL({ size: 1024, extension: 'png', forceStatic: false });

                const embed = new EmbedBuilder()
                    .setTitle(`🖼️ Discord-Profil von ${fetchedUser.username}`)
                    .setThumbnail(avatarUrl)
                    .setColor(0x5865F2)
                    .setTimestamp();

                const buttons = [];

                buttons.push(
                    new ButtonBuilder()
                        .setLabel('📥 Avatar Herunterladen')
                        .setStyle(ButtonStyle.Link)
                        .setURL(avatarUrl)
                );

                if (bannerUrl) {
                    embed.setImage(bannerUrl);
                    embed.addFields({ name: '🎨 Banner', value: 'Banner ist unten angezeigt.', inline: false });

                    buttons.push(
                        new ButtonBuilder()
                            .setLabel('🎨 Banner Herunterladen')
                            .setStyle(ButtonStyle.Link)
                            .setURL(bannerUrl)
                    );
                } else {
                    embed.addFields({ name: '🎨 Banner', value: 'Kein benutzerdefinierter Banner vorhanden.', inline: false });
                }

                const row = new ActionRowBuilder().addComponents(buttons);

                await interaction.editReply({ embeds: [embed], components: [row] });
            } catch (err) {
                console.error('DiscordPFP Error:', err.message);
                await interaction.editReply({ content: '❌ Fehler beim Abrufen des Profils.' });
            }
        }
    }

    if (interaction.isButton()) {
        if (interaction.customId === 'reload_cat') {
            await interaction.deferUpdate();
            try {
                const payload = await createCatPayload();
                if (payload) await interaction.editReply(payload);
            } catch (err) {
                console.error('Cat Reload Error:', err.message);
            }
        }

        if (interaction.customId.startsWith('reload_waifu_')) {
            const tag = interaction.customId.replace('reload_waifu_', '');
            await interaction.deferUpdate();
            try {
                const payload = await createWaifuPayload(tag);
                if (payload) await interaction.editReply(payload);
            } catch (err) {
                console.error('Waifu Reload Error:', err.message);
            }
        }

        if (interaction.customId === 'reload_male') {
            await interaction.deferUpdate();
            try {
                const payload = await createMalePayload();
                if (payload) await interaction.editReply(payload);
            } catch (err) {
                console.error('Male Reload Error:', err.message);
            }
        }

        if (interaction.customId.startsWith('reload_tsundere_')) {
            const tag = interaction.customId.replace('reload_tsundere_', '');
            const targetTag = tag === 'random' ? null : tag;

            await interaction.deferUpdate();
            try {
                const payload = await createTsunderePayload(targetTag);
                if (payload) await interaction.editReply(payload);
            } catch (err) {
                console.error('Tsundere Reload Error:', err.message);
            }
        }

        if (interaction.customId.startsWith('reload_mcstatus_')) {
            const restId = interaction.customId.replace('reload_mcstatus_', '');
            const lastUnderscore = restId.lastIndexOf('_');
            const targetIp = restId.substring(0, lastUnderscore);
            const showIp = restId.substring(lastUnderscore + 1) === 'true';

            await interaction.deferUpdate();
            try {
                const payload = await createMcStatusPayload(targetIp, showIp);
                if (payload) await interaction.editReply(payload);
            } catch (err) {
                console.error('MC Status Reload Error:', err.message);
            }
        }
    }
});

client.login(TOKEN);
