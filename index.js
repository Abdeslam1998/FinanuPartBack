var express = require('express');
var cors = require('cors');
var bodyParser = require('body-parser');

var krankenkasse_calculator = require('./routes/krankenkasse.js');
var rechtschutz = require('./routes/rechtschutz.js');
var Users = require('./routes/Users.js');
const automotorrad = require('./routes/automotorrad.js');
const hausrat = require('./routes/hausrat.js');
const dl = require('./routes/dlFinance.js');
const socket = require('socket.io')
const app = express()

app.use(cors({ origin: true, credentials: true }));
app.use(bodyParser.json());
const port = 5000


app.use('/krankenkasse', krankenkasse_calculator);
app.use('/rechtschutz',rechtschutz);
app.use('/automotorrad',automotorrad);
app.use('/hausrat',hausrat);
app.use('/dl',dl);
app.use('/', Users);


app.use(express.static('public'));
app.use('/uploads', express.static('images'));

const server =  app.listen(port, () => console.log(`App listening on port ${port}!`))

const io = socket(server, {
    cors: {
        origin: "*",
        credentials: true,
    },
});

global.onlineUsers = new Map();

io.on("connection", (socket) => {
    global.chatSocket = socket;

    socket.on("add-user", (userId) => {
        onlineUsers.set(userId, socket.id);
    });

    socket.on("send-msg", (data) => {
        const sendUserSocket = onlineUsers.get(data.to);
        if (sendUserSocket) {
            socket.to(sendUserSocket).emit("msg-recieve", data.message);
        }
    });
});


