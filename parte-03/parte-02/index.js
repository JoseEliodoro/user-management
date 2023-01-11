/* const http = require('http');

let server = http.createServer((req, res)=>{

    console.log('URL:', req.url);
    console.log('METHOD:', req.method);

    switch (req.url) {

        case '/':

            res.statusCode = 200;
            res.setHeader('Content-Type', 'text/html');
            res.end('<h1>Olá</h1>');

        break;
        case '/users':

            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
                users: [{
                    name: 'jose carlos',
                    email: 'jose@gmail.com',
                    id: 1
                }]
            }));

        break;
    }


});

server.listen(3000, '127.0.0.1', ()=>{

    console.log('servidor rodando!');

}); */ 
const express = require('express');
const consign = require('consign');
const bodyParser = require('body-parser')
const expressValidator = require('express-validator');
//let routesIndex = require('./routes/index');
//let routesUsers = require('./routes/users'); 

let app = express();

/* app.use(routesIndex);
app.use('/users', routesUsers);
 */


app.use(bodyParser.urlencoded({extended: false, limit: '50mb'}));
app.use(bodyParser.json({limit: '50mb'}));
app.use(expressValidator());


consign().include('routes').include('utils').into(app);

/* app.get('',(req, res)=>{

    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/html');
    res.end('<h1>Olá</h1>');

});

app.get('/users', (req, res)=>{

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json({
        users: [{
            name: 'jose carlos',
            email: 'jose@gmail.com',
            id: 1
        }]
    });
}); */


app.listen(4000, '127.0.0.1', ()=>{

    console.log('servidor rodando!');

});