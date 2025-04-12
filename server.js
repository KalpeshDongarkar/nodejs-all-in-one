const express = require('express')
const helmet = require('helmet')
var morgan = require('morgan');
const cors = require('cors');
const cluster = require('cluster');
const os = require('os');

const app = express()
const port = 3000;
const numCPUs = os.cpus().length / 2;

app.use(cors());
app.use(morgan('dev'));
app.use(helmet())

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (cluster.isMaster) {
    for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
    }

    require('./routes/auth.routes')(app)
    require('./routes/apis.routes')(app)

    cluster.on('exit', (worker, code, signal) => {
        console.log(`Worker process ${worker.process.pid} died. Restarting...`);
        cluster.fork();
    });
} else {
    console.log(`Worker ${process.pid} started`);
}






app.listen(port, () => console.log(`Example app listening on port ${port}!`))