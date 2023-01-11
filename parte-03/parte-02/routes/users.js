/* let express = require('express');
let routes =  express.Router();


routes.get('/', (req, res)=>{

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json({
        users: [{
            name: 'jose carlos',
            email: 'jose@gmail.com',
            id: 1
        }]
    });

}); 

routes.get('/admin', (req, res)=>{

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json({
        users: []
    });

});

module.exports = routes; */
let NeDB = require('nedb');
let db = new NeDB({
    filename: 'users.db',
    autoload: true
});

module.exports = function(app){

    let route = app.route('/users');

    route.get((req, res)=>{

        db.find({}).sort({name:1}).exec((err, users)=>{

            if (err) {

                app.utils.error.send(err, req, res);

            } else{
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json({
                    users
                });
            }

        });

        

    });


    route.post((req, res)=>{

        if (!app.utils.validator.user(app, req, res)) return false;

        db.insert(req.body, (err, user)=>{

            if (err) {

                app.utils.error.send(err, req, res);

            } else{
                res.status(200).json(user);
            }


        });

    });

    let routeID = app.route('/users/:id');

    routeID.get((req, res)=>{

        db.findOne({_id:req.params.id}).exec((err, user)=>{

            if (err) {
                app.utils.error.send(err, req, res);
            } else{

                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(user);

            }

        });


    });

    routeID.put((req, res)=>{

        if (!app.utils.validator.user(app, req, res)) return false;

        db.update({_id:req.params.id}, req.body, err=>{

            if (err) {
                app.utils.error.send(err, req, res);
            } else{

                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(Object.assign(req.body, req.params));

            }

        });


    });

    routeID.delete((req, res)=>{

        db.remove({_id:req.params.id}, {}, err=>{

            if (err) {
                app.utils.error.send(err, req, res);
            } else{

                res.json(req.params);

            }

        });


    });

};