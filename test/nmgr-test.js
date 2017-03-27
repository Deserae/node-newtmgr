var chai = require("chai");
var sinon = require("sinon");
var sinonChai = require("sinon-chai");
var expect = chai.expect;
chai.use(sinonChai);

var through2 = require('through2');
var Stream = require('stream');

var nmgr = require('../nmgr');


var resetCommand = new Buffer([0x02, 0x00, 0x00, 0x02, 0x00, 0x00, 0x00, 0x05, 0x7b, 0x7d]);
var listResponseDecoded = new Buffer([0x01, 0x00, 0x00, 0xf4, 0x00, 0x01, 0x00, 0x00, 0xbf, 0x66, 0x69, 0x6d, 0x61, 0x67, 0x65, 0x73, 0x9f, 0xbf, 0x64, 0x73, 0x6c, 0x6f, 0x74, 0x00, 0x67, 0x76, 0x65, 0x72, 0x73, 0x69, 0x6f, 0x6e, 0x65, 0x30, 0x2e, 0x30, 0x2e, 0x30, 0x64, 0x68, 0x61, 0x73, 0x68, 0x58, 0x20, 0x04, 0x5a, 0x74, 0xef, 0xc7, 0xd9, 0x51, 0x7d, 0xf1, 0xf0, 0xc1, 0x57, 0xf3, 0x18, 0x00, 0x42, 0xcf, 0x97, 0x1b, 0xfb, 0x79, 0x30, 0xeb, 0x71, 0x11, 0x08, 0x7a, 0x82, 0xf0, 0x72, 0xcd, 0x7a, 0x68, 0x62, 0x6f, 0x6f, 0x74, 0x61, 0x62, 0x6c, 0x65, 0xf5, 0x67, 0x70, 0x65, 0x6e, 0x64, 0x69, 0x6e, 0x67, 0xf4, 0x69, 0x63, 0x6f, 0x6e, 0x66, 0x69, 0x72, 0x6d, 0x65, 0x64, 0xf5, 0x66, 0x61, 0x63, 0x74, 0x69, 0x76, 0x65, 0xf5, 0x69, 0x70, 0x65, 0x72, 0x6d, 0x61, 0x6e, 0x65, 0x6e, 0x74, 0xf4, 0xff, 0xbf, 0x64, 0x73, 0x6c, 0x6f, 0x74, 0x01, 0x67, 0x76, 0x65, 0x72, 0x73, 0x69, 0x6f, 0x6e, 0x65, 0x30, 0x2e, 0x30, 0x2e, 0x30, 0x64, 0x68, 0x61, 0x73, 0x68, 0x58, 0x20, 0x41, 0x17, 0xdf, 0x7c, 0x1d, 0xc4, 0x0f, 0x54, 0xf3, 0xee, 0xbf, 0x85, 0x11, 0x73, 0xf9, 0x11, 0x41, 0xce, 0x6f, 0x92, 0x20, 0xfa, 0x1e, 0x83, 0xe2, 0x93, 0x62, 0x34, 0xd3, 0xa0, 0x5a, 0xca, 0x68, 0x62, 0x6f, 0x6f, 0x74, 0x61, 0x62, 0x6c, 0x65, 0xf4, 0x67, 0x70, 0x65, 0x6e, 0x64, 0x69, 0x6e, 0x67, 0xf4, 0x69, 0x63, 0x6f, 0x6e, 0x66, 0x69, 0x72, 0x6d, 0x65, 0x64, 0xf4, 0x66, 0x61, 0x63, 0x74, 0x69, 0x76, 0x65, 0xf4, 0x69, 0x70, 0x65, 0x72, 0x6d, 0x61, 0x6e, 0x65, 0x6e, 0x74, 0xf4, 0xff, 0xff, 0x6b, 0x73, 0x70, 0x6c, 0x69, 0x74, 0x53, 0x74, 0x61, 0x74, 0x75, 0x73, 0x02, 0xff]);

var nmrReset = {};
nmrReset.Data = Buffer.from("{}");
nmrReset.Op = 2;
nmrReset.Flags = 0;
nmrReset.Len = nmrReset.Data.length;
nmrReset.Group = 0;
nmrReset.Seq = 0;
nmrReset.Id = 5;

var listResponseObject = 
{ Op: 1,
  Flags: 0,
  Len: 244,
  Group: 1,
  Seq: 0,
  Id: 0,
  Data: new Buffer([0xbf, 0x66, 0x69, 0x6d, 0x61, 0x67, 0x65, 0x73, 0x9f, 0xbf, 0x64, 0x73, 0x6c, 0x6f, 0x74, 0x00, 0x67, 0x76, 0x65, 0x72, 0x73, 0x69, 0x6f, 0x6e, 0x65, 0x30, 0x2e, 0x30, 0x2e, 0x30, 0x64, 0x68, 0x61, 0x73, 0x68, 0x58, 0x20, 0x04, 0x5a, 0x74, 0xef, 0xc7, 0xd9, 0x51, 0x7d, 0xf1, 0xf0, 0xc1, 0x57, 0xf3, 0x18, 0x00, 0x42, 0xcf, 0x97, 0x1b, 0xfb, 0x79, 0x30, 0xeb, 0x71, 0x11, 0x08, 0x7a, 0x82, 0xf0, 0x72, 0xcd, 0x7a, 0x68, 0x62, 0x6f, 0x6f, 0x74, 0x61, 0x62, 0x6c, 0x65, 0xf5, 0x67, 0x70, 0x65, 0x6e, 0x64, 0x69, 0x6e, 0x67, 0xf4, 0x69, 0x63, 0x6f, 0x6e, 0x66, 0x69, 0x72, 0x6d, 0x65, 0x64, 0xf5, 0x66, 0x61, 0x63, 0x74, 0x69, 0x76, 0x65, 0xf5, 0x69, 0x70, 0x65, 0x72, 0x6d, 0x61, 0x6e, 0x65, 0x6e, 0x74, 0xf4, 0xff, 0xbf, 0x64, 0x73, 0x6c, 0x6f, 0x74, 0x01, 0x67, 0x76, 0x65, 0x72, 0x73, 0x69, 0x6f, 0x6e, 0x65, 0x30, 0x2e, 0x30, 0x2e, 0x30, 0x64, 0x68, 0x61, 0x73, 0x68, 0x58, 0x20, 0x41, 0x17, 0xdf, 0x7c, 0x1d, 0xc4, 0x0f, 0x54, 0xf3, 0xee, 0xbf, 0x85, 0x11, 0x73, 0xf9, 0x11, 0x41, 0xce, 0x6f, 0x92, 0x20, 0xfa, 0x1e, 0x83, 0xe2, 0x93, 0x62, 0x34, 0xd3, 0xa0, 0x5a, 0xca, 0x68, 0x62, 0x6f, 0x6f, 0x74, 0x61, 0x62, 0x6c, 0x65, 0xf4, 0x67, 0x70, 0x65, 0x6e, 0x64, 0x69, 0x6e, 0x67, 0xf4, 0x69, 0x63, 0x6f, 0x6e, 0x66, 0x69, 0x72, 0x6d, 0x65, 0x64, 0xf4, 0x66, 0x61, 0x63, 0x74, 0x69, 0x76, 0x65, 0xf4, 0x69, 0x70, 0x65, 0x72, 0x6d, 0x61, 0x6e, 0x65, 0x6e, 0x74, 0xf4, 0xff, 0xff, 0x6b, 0x73, 0x70, 0x6c, 0x69, 0x74, 0x53, 0x74, 0x61, 0x74, 0x75, 0x73, 0x02, 0xff]) };



describe('nmgr', function () {
  var readable;

  beforeEach(function () {
    readable = new Stream.Readable();
    readable._read = function(size) { /* do nothing */ };
  });


  it('should serialize a command', function (done) {

    var nmr = nmgr._resetCommand();
    var cmd = nmgr._serialize(nmr);

    expect(cmd).to.deep.equal(resetCommand);
    done();
  });


  it('should deserialize a command', function (done) {

    var nmr = nmgr._deserialize(resetCommand);
    expect(nmr).to.deep.equal(nmrReset);
    done();
  });

  it('should accumulate', function (done) {


    var listen = through2.obj(function (chunk, enc, callback) {

      expect(chunk).to.deep.equal(listResponseObject);
      callback();
      done();
    });

    readable
      .pipe(nmgr._accumulate())
      .pipe(listen);

    readable.emit('data', listResponseDecoded);
    readable.emit('end');
  });

  it('should read response', function (done) {

    var transport = {};
    transport.readPacket = function(){
      return readable;
    }

    nmgr._readResp(transport, null, function(err, data){
      expect(data).to.deep.equal(listResponseObject);
      done();
    });

    readable.emit('data', listResponseDecoded);
    readable.emit('end');
  });

});
