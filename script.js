var cheerio = require('cheerio');
var request = require('request');
var URL = require('url-parse');


var Crawler = function() {
  this.sites = [];
  this.max_visits = 10000;
  this.visits = 0;
  this.error_reports = [];
  this.max_depth = 10;
  this.depth = 0;
}

Crawler.prototype.handlePage = function(site) {
  this.visits++;
  var context = this;
  var pageToVisit = site;
  // console.log('Visiting:', site);
  request(pageToVisit, function(error, response, body) {
    if (error) {
      console.log('There has been an error. See report');
      context.error_reports.push(error);
    }

    if (response && response.statusCode === 200) {
      console.log('200 OK Visiting:', site);
      var $ = cheerio.load(body);
      var siteCollection = $('a');
      context.scanForLinks(siteCollection);
    }
  });

};


Crawler.prototype.scanForLinks = function(siteCollection) {
  var toVisit = [];
  for (var site in siteCollection) {
    if (siteCollection[site].attribs){
      toVisit.push(siteCollection[site].attribs.href);
    }
  }
  var links = [];
  for (var i = 0; i < toVisit.length; i++) {
    if (toVisit[i] && toVisit[i].slice(0,4) === 'http') {
     
      links.push(toVisit[i]);
      this.sites.push(toVisit[i]);
    }
  }

  for (var i = 0; i < links.length; i++) {
    if (this.visits <= this.max_visits) {
      this.depth++;
      if (this.depth < this.max_depth) {
        this.handlePage(links[i]);
        this.depth--;
      }
    }
  }
};

var crawler = new Crawler();

crawler.handlePage('https://en.wikipedia.org/wiki/Web_crawler#Re-visit_policy');
