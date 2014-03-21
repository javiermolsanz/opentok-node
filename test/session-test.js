var expect = require('chai').expect,
    nock = require('nock'),
    async = require('async');

// Subject
var Session = require('../lib/session.js'),
    OpenTok = require('../lib/opentok.js');

// Fixtures
var apiKey = '123456',
    apiSecret = '1234567890abcdef1234567890abcdef1234567890'
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

describe('Session', function() {
  beforeEach(function() {
    this.opentok = new OpenTok(apiKey, apiSecret);
  });

  it('initializes with no options', function() {
    var session = new Session(this.opentok, sessionId);
      expect(session).to.be.an.instanceof(Session);
      expect(session.sessionId).to.equal(sessionId);
  });

  describe('when initialized with just a p2p option', function() {
    it('has a p2p property', function() {
      var session = new Session(this.opentok, sessionId, { p2p: true });
      expect(session).to.be.an.instanceof(Session);
      expect(session.p2p).to.be.true
      session = new Session(this.opentok, sessionId, { p2p: false });
      expect(session).to.be.an.instanceof(Session);
      expect(session.p2p).to.be.false
    });
    it('does not have a location property', function() {
      var session = new Session(this.opentok, sessionId, { p2p: true });
      expect(session).to.be.an.instanceof(Session);
      expect(session.location).to.not.exist
    });
  });

  describe('when initialized with just a location option', function() {
    it('has a location property', function() {
      var session = new Session(this.opentok, sessionId, { location: '12.34.56.78' });
      expect(session).to.be.an.instanceof(Session);
      expect(session.location).to.equal('12.34.56.78');
    });
    it('does not have a p2p property', function() {
      var session = new Session(this.opentok, sessionId, { location: '12.34.56.78' });
      expect(session).to.be.an.instanceof(Session);
      expect(session.p2p).to.not.exist
    });
  });

  describe('#generateToken', function() {
    beforeEach(function() {
      this.session = new Session(this.opentok, sessionId);
    });
    // TODO: check all the invalid stuff
    it('generates tokens', function() {
      var token = this.session.generateToken();
      expect(token).to.be.a('string');
      // TODO: decode and check its properties
    });
    it('assigns a role in the token', function() {
      var token = this.session.generateToken();
      expect(token).to.be.a('string');
      // TODO: decode and check that its a publisher

      token = this.session.generateToken({role:'subscriber'});
      expect(token).to.be.a('string');
      // TODO: decode and check that its a subscriber
    });
    it('assigns an expire time in the token', function() {
      var token = this.session.generateToken();
      expect(token).to.be.a('string');
      // TODO: decode and check that its expireTime is one day

      var inAWhile =(new Date().getTime() / 1000) + (10);
      token = this.session.generateToken({
        expireTime: inAWhile
      });
      expect(token).to.be.a('string');
      // TODO: decode and check that the time is right
    });
    it('assigns an connection data to the token', function() {
      var token = this.session.generateToken({ data: 'name=Johnny' });
      expect(token).to.be.a('string');
      // TODO: decode and check its data
    });
  });

});
