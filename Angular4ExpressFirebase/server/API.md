06/06/2017
API Developer Guide(Angular 2 + Express)

Squareup API

- Get Location
var request = require("request");

var options = { method: 'GET',
  url: 'https://connect.squareup.com/v2/locations',
  headers: 
   { 'postman-token': '469382d7-98cf-0fc7-7210-22bc6d2812bd',
     'cache-control': 'no-cache',
     authorization: 'Bearer sq0atp-ZR1s4_nwBHSd8hb39tflIQ' } };

request(options, function (error, response, body) {
  if (error) throw new Error(error);

  console.log(body);
});

- Get Category
var request = require("request");

var options = { method: 'GET',
  url: 'https://connect.squareup.com/v2/catalog/list',
  headers: 
   { 'postman-token': '660b7198-41d5-a82c-8faa-aa51dcfa88b3',
     'cache-control': 'no-cache',
     authorization: 'Bearer sq0atp-ZR1s4_nwBHSd8hb39tflIQ' } };

request(options, function (error, response, body) {
  if (error) throw new Error(error);

  console.log(body);
});
- Get Transaction
var request = require("request");

var options = { method: 'GET',
  url: 'https://connect.squareup.com/v2/locations/CBASELGZ5XElMpNcgyfVMwIHBxggAQ/transactions',
  headers: 
   { 'postman-token': '5a3805c4-c3d4-113d-4574-0f963c152c70',
     'cache-control': 'no-cache',
     authorization: 'Bearer sandbox-sq0atb-g6U5GLA6BfnYi1N0GlBNpg' } };

request(options, function (error, response, body) {
  if (error) throw new Error(error);

  console.log(body);
});
