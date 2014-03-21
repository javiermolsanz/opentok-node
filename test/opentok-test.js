var expect = require('chai').expect,
    nock = require('nock'),
    async = require('async');

// Subject
var OpenTok = require('../lib/opentok.js'),
    Session = require('../lib/session.js'),
    package = require('../package.json');

// Fixtures
var apiKey = '123456',
    apiSecret = '1234567890abcdef1234567890abcdef1234567890'
    apiUrl = 'http://mymock.example.com',
    // This is specifically concocted for these tests (uses fake apiKey/apiSecret above)
    sessionId = '1_MX4xMjM0NTZ-flNhdCBNYXIgMTUgMTQ6NDI6MjMgUERUIDIwMTR-MC40OTAxMzAyNX4';
nock.disableNetConnect();

var recording = false;
if (recording) {
  // set these values before changing the above to true
  apiKey = '',
  apiSecret = '';
  nock.enableNetConnect();
  nock.recorder.rec();
}

// Helpers
var helpers = require('./helpers.js');

describe('OpenTok', function() {
  it('should initialize with a valid apiKey and apiSecret', function() {
    var opentok = new OpenTok(apiKey, apiSecret);
    expect(opentok).to.be.an.instanceof(OpenTok);
  });
  it('should initialize without `new`', function() {
    var opentok = OpenTok(apiKey, apiSecret);
    expect(opentok).to.be.an.instanceof(OpenTok);
  });
  it('should not initialize with just an apiKey but no apiSecret', function() {
    var opentok = new OpenTok(apiKey);
    expect(opentok).to.not.be.an.instanceof(OpenTok);
  });
  it('should not initialize with incorrect type parameters', function() {
    var opentok = new OpenTok(new Date(), 'asdasdasdasdasd');
    expect(opentok).to.not.be.an.instanceof(OpenTok);
    opentok = new OpenTok(4, {});
    expect(opentok).to.not.be.an.instanceof(OpenTok);
  });
  it('should cooerce a number for the apiKey', function() {
    var opentok = new OpenTok(parseInt(apiKey), apiSecret);
    expect(opentok).to.be.an.instanceof(OpenTok);
  });

  describe('when initialized with an apiUrl', function() {
    beforeEach(function() {
      this.opentok = new OpenTok(apiKey, apiSecret, apiUrl);
    });
    it('sends its requests to the set apiUrl', function(done) {
       var scope = nock(apiUrl)
        .matchHeader('x-tb-partner-auth', apiKey+':'+apiSecret)
        .matchHeader('user-agent', new RegExp("OpenTok-Node-SDK\/"+package.version))
        .post('/hl/session/create', "p2p.preference=false")
        .reply(200, "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?><sessions><Session><session_id>SESSIONID</session_id><partner_id>123456</partner_id><create_dt>Wed Mar 19 23:35:24 PDT 2014</create_dt></Session></sessions>", { server: 'nginx',
        date: 'Thu, 20 Mar 2014 06:35:24 GMT',
        'content-type': 'text/xml',
        connection: 'keep-alive',
        'access-control-allow-origin': '*',
        'x-tb-host': 'mantis503-nyc.tokbox.com',
        'content-length': '211' });
      this.opentok.createSession(function(err, session){
        expect(session).to.be.an.instanceof(Session);
        expect(session.sessionId).to.equal('SESSIONID');
        scope.done();
        done(err);
      });
    });
  });

  describe('#createSession', function() {

    beforeEach(function() {
      this.opentok = new OpenTok(apiKey, apiSecret);
    });

    it('creates a new session', function(done) {
      var scope = nock('https://api.opentok.com:443')
        .matchHeader('x-tb-partner-auth', apiKey+':'+apiSecret)
        .matchHeader('user-agent', new RegExp("OpenTok-Node-SDK\/"+package.version))
        .post('/hl/session/create', "p2p.preference=false")
        .reply(200, "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?><sessions><Session><session_id>SESSIONID</session_id><partner_id>123456</partner_id><create_dt>Wed Mar 19 23:35:24 PDT 2014</create_dt></Session></sessions>", { server: 'nginx',
        date: 'Thu, 20 Mar 2014 06:35:24 GMT',
        'content-type': 'text/xml',
        connection: 'keep-alive',
        'access-control-allow-origin': '*',
        'x-tb-host': 'mantis503-nyc.tokbox.com',
        'content-length': '211' });
      // pass no options parameter
      this.opentok.createSession(function(err, session){
        expect(session).to.be.an.instanceof(Session);
        expect(session.sessionId).to.equal('SESSIONID');
        expect(session.p2p).to.be.false
        scope.done();
        done(err);
      });
    });

    it('creates a peer to peer session', function(done) {
      var scope = nock('https://api.opentok.com:443')
        .matchHeader('x-tb-partner-auth', apiKey+':'+apiSecret)
        .matchHeader('user-agent', new RegExp("OpenTok-Node-SDK\/"+package.version))
        .post('/hl/session/create', "p2p.preference=true")
        .reply(200, "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?><sessions><Session><session_id>SESSIONID</session_id><partner_id>123456</partner_id><create_dt>Thu Mar 20 07:02:45 PDT 2014</create_dt></Session></sessions>", { server: 'nginx',
        date: 'Thu, 20 Mar 2014 14:02:45 GMT',
        'content-type': 'text/xml',
        connection: 'keep-alive',
        'access-control-allow-origin': '*',
        'x-tb-host': 'oms506-nyc.tokbox.com',
        'content-length': '211' });
      // passes p2p: true
      this.opentok.createSession({ 'p2p' : true }, function(err, session) {
        expect(session).to.be.an.instanceof(Session);
        expect(session.sessionId).to.equal('SESSIONID');
        expect(session.p2p).to.be.true
        scope.done();
        done(err);
      });
    });

    it('adds a location hint to the created session', function(done) {
      var scope = nock('https://api.opentok.com:443')
        .matchHeader('x-tb-partner-auth', apiKey+':'+apiSecret)
        .matchHeader('user-agent', new RegExp("OpenTok-Node-SDK\/"+package.version))
        .post('/hl/session/create', "location=12.34.56.78&p2p.preference=false")
        .reply(200, "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?><sessions><Session><session_id>SESSIONID</session_id><partner_id>123456</partner_id><create_dt>Thu Mar 20 07:17:22 PDT 2014</create_dt></Session></sessions>", { server: 'nginx',
        date: 'Thu, 20 Mar 2014 14:17:22 GMT',
        'content-type': 'text/xml',
        connection: 'keep-alive',
        'access-control-allow-origin': '*',
        'x-tb-host': 'oms506-nyc.tokbox.com',
        'content-length': '211' });
      // passes location: '12.34.56.78'
      this.opentok.createSession({ 'location': '12.34.56.78' }, function(err, session) {
        expect(session).to.be.an.instanceof(Session);
        expect(session.sessionId).to.equal('SESSIONID');
        expect(session.p2p).to.be.false
        expect(session.location).to.equal('12.34.56.78');
        scope.done()
        done(err);
      });
    });

    it('complains when the p2p or location values are not valid', function(done) {
      var self = this;
      // YAY higher order programming :)
      var expectError = function(cb) {
        return function(err, result) {
          expect(err).to.be.an.instanceof(Error);
          cb(null)
        };
      };
      async.parallel([
        function(cb) {
          self.opentok.createSession({ p2p: 'lalalal' }, expectError(cb))
        },
        function(cb) {
          self.opentok.createSession({ location: 'not an ip address' }, expectError(cb))
        }
      ], done);
    });

    it('complains when there is no callback function', function() {
      // this is the only synchronous error, because there is no mechanism for an asyc one
      var result = this.opentok.createSession();
      expect(result).to.be.an.instanceof(Error);
    });

    it('compains when a server error takes place', function(done) {
      var scope = nock('https://api.opentok.com:443')
        .matchHeader('x-tb-partner-auth', apiKey+':'+apiSecret)
        .matchHeader('user-agent', new RegExp("OpenTok-Node-SDK\/"+package.version))
        .post('/hl/session/create', "p2p.preference=false")
        .reply(500, "", { server: 'nginx',
        date: 'Thu, 20 Mar 2014 06:35:24 GMT',
        'content-type': 'text/xml',
        connection: 'keep-alive',
        'access-control-allow-origin': '*',
        'x-tb-host': 'mantis503-nyc.tokbox.com',
        'content-length': '0' });
      this.opentok.createSession(function(err, session) {
        expect(err).to.be.an.instanceof(Error);
        scope.done();
        done();
      });
    });

  });


  describe('#generateToken', function() {

    beforeEach(function() {
      this.opentok = new OpenTok(apiKey, apiSecret);
      this.sessionId = sessionId;
    });

    it('generates a token', function() {
      // call generateToken with no options
      var token = this.opentok.generateToken(this.sessionId);
      expect(token).to.be.a('string');
      // TODO: decode token and verify signature
    });

    it('assigns a role in the token', function() {
      // expects one with no role defined to assign "publisher"
      var defaultRoleToken = this.opentok.generateToken(this.sessionId);
      expect(defaultRoleToken).to.be.a('string');
      // TODO: decode token, verify signature, make sure "role" matches 'publisher'

      // expects one with a valid role defined to set it
      var subscriberToken = this.opentok.generateToken(this.sessionId, { role : 'subscriber' });
      expect(subscriberToken).to.be.a('string');
      // TODO: decode token, verify signature, make sure "role" matches 'subscriber'

      // expects one with an invalid role to complain
      var invalidToken = this.opentok.generateToken(this.sessionId, { role : 5 });
      expect(invalidToken).to.not.be.ok;
    });

    it('sets an expiration time for the token', function() {
      // expects a token with no expiration time to assign 1 day
      var defaultExpireToken = this.opentok.generateToken(this.sessionId);
      expect(defaultExpireToken).to.be.a('string');
      // TODO decode and check

      // expects a token with an expiration time to have it
      var expireTime =  new Date().getTime() / 1000 + (60*60); // 1 hour
      var oneHourToken = this.opentok.generateToken(this.sessionId, { expireTime: expireTime });
      expect(oneHourToken).to.be.a('string');
      // TODO decode and check

      // expects a token with an invalid expiration time to complain
      var invalidToken = this.opentok.generateToken(this.sessionId, { expireTime: "not a time" });
      expect(invalidToken).to.not.be.ok;

      // expects a token with a time to thats in the past to complain
      var invalidToken = this.opentok.generateToken(this.sessionId, { expireTime: "not a time" });
      expect(invalidToken).to.not.be.ok;
    });

    it('sets connection data in the token', function() {
      // expects a token with a connection data to have it
      var dataBearingToken = this.opentok.generateToken(this.sessionId, { data: 'name=Johnny' });
      expect(dataBearingToken).to.be.a('string');
      // TODO decode and check

      // expects a token with invalid connection to complain
      var invalidToken = this.opentok.generateToken(this.sessionId, { data: { 'dont': 'work' } });
      expect(invalidToken).to.not.be.ok;

      var tooLongDataToken = this.opentok.generateToken(this.sessionId, {
        data: Array(2000).join("a") // 1999 char string of all 'a's
      });
      expect(tooLongDataToken).to.not.be.ok;
    });

    it('complains if the sessionId is not valid', function() {
      var badToken = this.opentok.generateToken();
      expect(badToken).to.not.be.ok;

      badToken = this.opentok.generateToken('blahblahblah');
      expect(badToken).to.not.be.ok;
    });

    it('contains a unique nonce', function() {
      // generate a few and show the nonce exists each time and that they are different
      var firstToken = this.opentok.generateToken(this.sessionId);
      var secondToken = this.opentok.generateToken(this.sessionId);
      // TODO decode and check if the nonce's are different
    });
  });

});
