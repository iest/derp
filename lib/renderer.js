var views = require('co-views');
var config = require('../config');

module.exports = views(config.view_directory, {
  default: config.template_extension
});