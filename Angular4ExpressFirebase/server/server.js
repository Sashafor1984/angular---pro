 
// Get dependencies
const express = require('express');
const path = require('path');
const http = require('http');
const bodyParser = require('body-parser');

// firebase config
var firebase = require("firebase");
var config = {
  apiKey: "Yours",
    authDomain: "yours-app.firebaseapp.com",
    databaseURL: "https://yours.firebaseio.com",
    projectId: "yours-app",
    storageBucket: "yours-app.appspot.com",
    messagingSenderId: "yours"
};
firebase.initializeApp(config);

// const api = require('./server/routes/api');
const app = express();
// Parsers for POST data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Point static path to dist
app.use(express.static(path.join(__dirname, './')));

// add EventSource dependency
var EventSource = require('eventsource');
// add json patch dependency
var JsonPatch   = require('fast-json-patch');

/**
 * Get port from environment and store in Express.
 */
const port = process.env.PORT || '3000';
app.set('port', port);

/**
 * Create HTTP server.
 */
const server = http.createServer(app);

/**
 * Firebase data async processing.
 */
//Global variables
var person_location;
var transactions;
var items;
var categories;
var modifiers;
var person_token = null;

app.get('/callback', function (req, res) {
  var authorization_code = req.query.code;
  if(authorization_code != null){
    console.log('Auth_code: ' + authorization_code);
    var application_id = 'yours';
    var application_secret = 'yours';
    var sandbox_application_id = 'yours';
    var url = 'https://connect.squareup.com/oauth2/token';
    const oauth_request_body = {
      'grant_type': authorization_code,
      'client_id': application_id,
      'client_secret': application_secret,
      'code': authorization_code
    }
    var request = require('request');
    request.post({url: url, formData: oauth_request_body}, function optionalCallback(err, httpResponse, body) {
      if (err) {
        return console.error('upload failed:', err);
      }
      var token = JSON.parse(body);
      person_token = token.access_token;
      console.log('Token:', person_token);
      Get_Data(person_token);
      res.redirect('http://localhost:4200');
    });

    // res.send(code);
    
    // var get_code = 1;
    // res.setHeader('Access-Control-Allow-Origin', '*');
    // res.json({success: get_code});
  }
  else{
    console.log('Auth error!');
  }
});
  
  function Get_Data(person_token){
     var stream_url = 'https://streamdata.motwin.net/';
      var app_token = 'yours';
      var targetUrl = 'https://connect.squareup.com/v2/';
      var url = stream_url + targetUrl + 'locations?X-Sd-Token=' + app_token;
      var eventSourceInitDict = {headers: {'Authorization':'Bearer ' + person_token }};
      var myEventSource = new EventSource(url, eventSourceInitDict);
      myEventSource.addEventListener('open', function(){
        console.log("Token Connected!");
      })
      myEventSource.addEventListener('error', function(e) {
        console.log('Connection ERROR!', e);
        myEventSource.close();
      });
      
      myEventSource.addEventListener('data', function(e) {
        //location :
        person_location = JSON.parse(e.data);
        var pos = person_location.locations.length;
        firebase.database().ref('/realtime_data/').set({});
        var i = null;
        for (i = 0; i < pos; i++){
          firebase.database().ref('/locations/' + i).set({
              'address'      : person_location.locations[i].address,
              'capabilities' : person_location.locations[i].capabilities,
              'id'           : person_location.locations[i].id,
              'name'         : person_location.locations[i].name,
              'timezone'     : person_location.locations[i].timezone
          });
        }
        var location = person_location.locations[0].id;
        if(location != null){
          console.log(person_location.locations[0].name);
        }
       
        //transaction list :
        var url_t = stream_url + targetUrl + 'locations/' + location + '/transactions' + '?X-Sd-Token=' + app_token;
        var myEventSource_transaction = new EventSource(url_t, eventSourceInitDict);
        myEventSource_transaction.addEventListener('data', function(e) {
          transactions = JSON.parse(e.data);
          var pos = transactions.transactions.length;
          console.log('transactions:' + pos);
          //firebase set(/transactions)
          firebase.database().ref('/transactions/').set({});
          var i;
          for (i = 0; i < pos; i++){
            firebase.database().ref('/transactions/' + i).set({
                'client_id'   : transactions.transactions[i].client_id,
                'created_at'  : transactions.transactions[i].created_at,
                'id'          : transactions.transactions[i].id,
                'location_id' : transactions.transactions[i].location_id,
                'product'     : transactions.transactions[i].product,
                'tenders'     : transactions.transactions[i].tenders
            });
          }
        });
        myEventSource_transaction.addEventListener('patch', function(e) {
          // console.log("lasted transactions: " + e.data);
          var trans = JSON.parse(e.data);
          // console.log(e.data.path);
          JsonPatch.applyPatch(transactions, JSON.parse(e.data));
          
          if(trans[0].op == 'add'){
            console.log('transaction:' + trans[0].op);  
            firebase.database().ref('/realtime_data/transaction/').push({
                'transactions' : trans
            });
            firebase.database().ref(trans[0].path).set({
                'client_id'   : trans[0].value.client_id,
                'created_at'  : trans[0].value.created_at,
                'id'          : trans[0].value.id,
                'location_id' : trans[0].value.location_id,
                'product'     : trans[0].value.product,
                'tenders'     : trans[0].value.tenders
            });
          }
        });
       
       //items list :
        var url_i = stream_url + targetUrl + 'catalog/list?types=ITEM' + '&X-Sd-Token=' + app_token;
        var myEventSource_items = new EventSource(url_i, eventSourceInitDict);
        var pos;
        myEventSource_items.addEventListener('data', function(e) {
          items = JSON.parse(e.data);
          pos = items.objects.length;
          console.log('items:' + pos);
          //firebase set(/items)
          var i;
          firebase.database().ref('/items/objects/').set({});
          for (i = 0; i < pos; i++){
            firebase.database().ref('/items/objects/' + i).set({
                'id'                       : items.objects[i].id,
                'is_deleted'               : items.objects[i].is_deleted,
                'item_data'                : items.objects[i].item_data,
                'present_at_all_locations' : items.objects[i].present_at_all_locations,
                'present_at_location_ids'  : items.objects[i].present_at_location_ids,
                'type'                     : items.objects[i].type,
                'updated_at'               : items.objects[i].updated_at,
                'version'                  : items.objects[i].version
            });
          }
        });
        myEventSource_items.addEventListener('patch', function(e) {
          console.log("lasted items: " + e.data);
          var items = JSON.parse(e.data);
          JsonPatch.applyPatch(items, JSON.parse(e.data));
          var i = pos;
          firebase.database().ref('/realtime_data/items').set({});
          if(items[0].op == 'add'){
            console.log('items:' + items[0].op);  
            firebase.database().ref('/realtime_data/items').push({
                'item' : items
            });
            
            firebase.database().ref('/items' + items[0].path).set({
                'id'                       : items[0].value.id,
                'is_deleted'               : items[0].value.is_deleted,
                'item_data'                : items[0].value.item_data,
                'present_at_all_locations' : items[0].value.present_at_all_locations,
                'present_at_location_ids'  : items[0].value.present_at_location_ids,
                'type'                     : items[0].value.type,
                'updated_at'               : items[0].value.updated_at,
                'version'                  : items[0].value.version
            });
            // pos = pos + 1;
          }
          if(items[0].op == 'remove'){
             firebase.database().ref('/items' + items[0].path).remove();
            //  firebase.database().ref('/items').update();
          }
          if(items[0].op == 'replace'){
            // console.log('OP:' + items[0].op);  
            // console.log('OP:' + items[0].path);  
            // firebase.database().ref('/realtime_data/').set({
            //     'transactions' : trans
            // });
            // firebase.database().ref('/transactions/0/').set({
            //     'client_id'   : trans[0].value.client_id,
            //     'created_at'  : trans[0].value.created_at,
            //     'id'          : trans[0].value.id,
            //     'location_id' : trans[0].value.location_id,
            //     'product'     : trans[0].value.product,
            //     'tenders'     : trans[0].value.tenders
            // });
          }
          
        });

        //category list :
        var url_c = stream_url + targetUrl + 'catalog/list?types=CATEGORY' + '&X-Sd-Token=' + app_token;
        var myEventSource_categories = new EventSource(url_c, eventSourceInitDict);
        myEventSource_categories.addEventListener('data', function(e) {
          categories = JSON.parse(e.data);
          var pos = categories.objects.length;
          //firebase set(/categories)
          var i;
          for (i = 0; i < pos; i++){
            firebase.database().ref('/categories/' + i).set({
                'category_data'             : categories.objects[i].category_data,
                'id'                        : categories.objects[i].id,
                'is_deleted'                : categories.objects[i].is_deleted,
                'present_at_all_locations'  : categories.objects[i].present_at_all_locations,
                'type'                      : categories.objects[i].type,
                'updated_at'                : categories.objects[i].updated_at,
                'version'                   : categories.objects[i].version
            });
          }
        });
        myEventSource_categories.addEventListener('patch', function(e) {
          console.log("lasted categories: " + e.data);
          JsonPatch.applyPatch(categories, JSON.parse(e.data));
        });

         //modifiers list :
        var url_m = stream_url + targetUrl + 'catalog/list?types=MODIFIER' + '&X-Sd-Token=' + app_token;
        var myEventSource_modifiers = new EventSource(url_m, eventSourceInitDict);
        myEventSource_modifiers.addEventListener('data', function(e) {
          modifiers = JSON.parse(e.data);
          // console.log(e.data);
          var pos = modifiers.objects.length;
          //firebase set(/modifiers)
          console.log('modifiers: '+ pos);
          var i;
          // for (i = 0; i < pos; i++){
          //   firebase.database().ref('/modifiers/' + i).set({
          //       'custom_attributes'         : modifiers.objects[i].custom_attributes,
          //       'id'                        : modifiers.objects[i].id,
          //       'is_deleted'                : modifiers.objects[i].is_deleted,
          //       'modifier_data'             : modifiers.objects[i].modifier_data,
          //       'present_at_all_locations'  : modifiers.objects[i].present_at_all_locations,
          //       'present_at_location_ids'   : modifiers.objects[i].present_at_location_ids,
          //       'type'                      : modifiers.objects[i].type,
          //       'updated_at'                : modifiers.objects[i].updated_at,
          //       'version'                   : modifiers.objects[i].version
          //   });
          // }
        });
        myEventSource_modifiers.addEventListener('patch', function(e) {
          console.log("lasted modifier: " + e.data);
          // JsonPatch.applyPatch(modifiers, JSON.parse(e.data));

        });

      });
      // latest data set provided.
      myEventSource.addEventListener('patch', function(e) {
        JsonPatch.applyPatch(person_location, JSON.parse(e.data));
        console.log(person_location);
      });
  }
  
  // get all of square DB
  // if(person_token != null){
  //   console.log(11111);
  //   Get_Data(person_token.access_token);
  // }
    
// Catch all other routes and return the index file
app.get('*', (req, res) => {
  console.log('All success!');
  res.sendFile(path.join(__dirname, '/index.html'));
});

/**
 * Listen on provided port, on all network interfaces.
 */
server.listen(port, () => console.log(`API running on localhost:${port}`));
