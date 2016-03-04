/**
 * Created by Jon on 3/4/16.
 */

////////////////////////////////////////////////////////////////////////////////
/// Libraries and database driver
////////////////////////////////////////////////////////////////////////////////

//var fs = require("fs");
var Promise = require("promise");
var morgan = require('morgan');
//var concat = require("concat-stream");

var server_addr = process.env.ARANGODB_SERVER ? process.env.ARANGODB_SERVER : "http://localhost:8529";
var ignore = console.log("Using DB-Server " + server_addr);

var Database = require("arangojs");

if (server_addr !== "none") {
    var db = new Database(server_addr);          // configure server
}

////////////////////////////////////////////////////////////////////////////////
/// An express app:
////////////////////////////////////////////////////////////////////////////////

var express = require('express');
var app = express();
app.use(morgan('dev'));

// leverage NODE_ENV to determine collectionName
var collectionName = "todoApp_todos";            // configure collection
var putRoute = "todoApp";
if (app.get('env') == "development") {
    putRoute = "dev/" + putRoute;
    collectionName = "dev_" + collectionName;
}

var collectionPromise = new Promise(function(resolve, reject) {
    db.collection(collectionName, false, function(err, res) {
        if (err) {
            reject(err);
        }
        else {
            resolve(res);
        }
    });
});

if (server_addr !== "none") {
    collectionPromise.then(null, function(err) {
        console.log("Cannot contact the database! Terminating...");
        process.exit(1);
    });
}

////////////////////////////////////////////////////////////////////////////////
/// Static content:
////////////////////////////////////////////////////////////////////////////////

app.use(express.static(__dirname + "/static"));
app.use(express.static(__dirname + "/node_modules"));

////////////////////////////////////////////////////////////////////////////////
/// AJAX services:
////////////////////////////////////////////////////////////////////////////////

app.get('/get', function(req, res) {

    res.send("OK");
});

app.get("/get/:key", function (req, res) {
    console.log("Inside app.get");
    var key = req.params["key"];
    collectionPromise.then(function(collection) {
        collection.document(key, function(err, x) {
            if (err) {
                // for production we should implement more sophisticated handling here. Like logging where appropriate etc.
                res.status(err.code);
                delete err.response
                res.json(err);
            }
            else {
                res.json(x);
            }
        });
    }, null);  // if this were rejected, we would be out already
});

//// This is just a trampoline to the Foxx app:
//var ep = (server_addr !== "none") ? db.route(putRoute) : undefined;
//
//app.put("/put", function (req, res) {
//    req.pipe(concat( function(body) {
//        // check out body-parser for a express middleware which handles json automatically
//        ep.put("put", JSON.parse(body.toString()),
//            function(err, x) {
//                if (err) {
//                    err.error = true;
//                    delete err.response;
//                    res.send(err);
//                }
//                else {
//                    res.send(x.body);
//                }
//            });
//    } ));
//});

////////////////////////////////////////////////////////////////////////////////
/// Now finally make the server:
////////////////////////////////////////////////////////////////////////////////

var server = app.listen(8000, function () {
    var host = server.address().address
    var port = server.address().port
    console.log('todo app server listening at http://%s:%s', host, port)
});