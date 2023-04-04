require('dotenv').config();
// REQUIER

const { Logger } = require('betterlogger.js');
const config = require('./config.json');

const { WebhookClient, EmbedBuilder } = require('discord.js');
const logger = new Logger('Index').setDebugging(99);

// WEBSITE
const express = require('express');
const app = express();

app.use((req, res, next) => {
    res.removeHeader('X-Powered-By');
    next();
});

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', req.headers.origin);
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    next();
});

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.render('index');
});

app.get('/ticketup', (req, res) => {
    res.render('tu-home');
});

app.get('/embed-builder', (req, res) => {
    res.render('embed-builder');
});

app.post('/submit', async (req, res) => {
    try {
        const embed = new EmbedBuilder();
        const webhook = new WebhookClient({ url: req.body.webhookUrl });

        await webhook.edit({
            avatar: req.body.webhookAvatar ? req.body.webhookAvatar : 'public/img/upbots-logo.png',
            name: req.body.webhookName ? req.body.webhookName : 'upbots.org',
        });

        if (req.body.title) {
            embed.setTitle(`${req.body.title}`);
        }

        if (req.body.description) {
            embed.setDescription(`${req.body.description}`);
        }

        if (req.body.footer) {
            embed.setFooter({ text: `${req.body.footer}` });
        }

        if (req.body.author) {
            embed.setAuthor({ name: `${req.body.author}` });
        }

        embed.setColor(`${req.body.color}`);

        webhook
            .send({ embeds: [embed] })
            .then(() => {
                res.render('embed-builder', { success: true });
            })
            .catch((error) => {
                res.render('embed-builder', { error: true });

                logger.alert(error);
            });
    } catch (err) {
        res.render('embed-builder', { error: true });

        logger.alert(err);
    }
});

app.listen(0 + process.env.PORT, () => {
    logger.info('Server started on port', process.env.PORT);
});
