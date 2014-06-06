var views = require('co-views');
var moment = require('moment');

module.exports = views(__dirname + '/../views', {
  default: 'jade'
});