var through2 = require('through2');
const cbor = require('borc')
var pipeline = require('pumpify');

var CONSTANTS = require('./constants');
var debug = require('debug')('newtmgr')


function generateTestBuffer(hash)
{
  if(!hash || typeof hash !=="string")
  {
    throw new Error("must supply hash as string")
  }

  var cmd = {}
  cmd.confirm = false;
  cmd.hash = new Buffer(hash, "hex")
  var encoded = cbor.encode(cmd)

  nmr = {};
  nmr.Data = encoded;
  nmr.Op = CONSTANTS.NMGR_OP_WRITE;
  nmr.Flags = 0;
  nmr.Len = encoded.length;
  nmr.Group = CONSTANTS.NMGR_GROUP_ID_IMAGE;
  nmr.Seq = 0;
  nmr.Id = CONSTANTS.IMGMGR_NMGR_ID_STATE;

  return _serialize(nmr);
}


function generateConfirmBuffer(hash)
{
  var hashBuffer = null;
  if(hash && typeof hash === "string"){
    hashBuffer = new Buffer(hash, "hex")
  }

  var cmd = {}
  cmd.confirm = true;
  cmd.hash = hashBuffer
  var encoded = cbor.encode(cmd)

  nmr = {};
  nmr.Data = encoded;
  nmr.Op = CONSTANTS.NMGR_OP_WRITE;
  nmr.Flags = 0;
  nmr.Len = encoded.length;
  nmr.Group = CONSTANTS.NMGR_GROUP_ID_IMAGE;
  nmr.Seq = 0;
  nmr.Id = CONSTANTS.IMGMGR_NMGR_ID_STATE;

  return _serialize(nmr);
}


function generateResetBuffer()
{
  nmr = {};
  nmr.Data = Buffer.from("{}");
  nmr.Op = CONSTANTS.NMGR_OP_WRITE;
  nmr.Flags = 0;
  nmr.Len = nmr.Data.length;
  nmr.Group = CONSTANTS.NMGR_GROUP_ID_DEFAULT;
  nmr.Seq = 0;
  nmr.Id = CONSTANTS.NMGR_ID_RESET;

  return _serialize(nmr);
}


function generateListBuffer()
{
  nmr = {};
  nmr.Data = Buffer.alloc(0)
  nmr.Op = CONSTANTS.NMGR_OP_READ;
  nmr.Flags = 0;
  nmr.Len = 0;
  nmr.Group = CONSTANTS.NMGR_GROUP_ID_IMAGE;
  nmr.Seq = 0;
  nmr.Id = CONSTANTS.IMGMGR_NMGR_ID_STATE;

  return _serialize(nmr);
}


function _serialize(nmr){

  const buf = Buffer.alloc(8);

  buf.writeUInt8(nmr.Op, 0);
  buf.writeUInt8(nmr.Flags, 1);

  buf.writeUInt16BE(nmr.Len, 2);
  buf.writeUInt16BE(nmr.Group, 4);

  buf.writeUInt8(nmr.Seq, 6);
  buf.writeUInt8(nmr.Id, 7);

  return Buffer.concat([buf, nmr.Data]);
}


function decode(){
  return pipeline.obj(_accumulate(), _decode());
}


function _decode() {

  function transform(data, enc, cb) {
    debug("_decode", data);
    var decoded = cbor.decodeFirst(data.Data);
    return cb(null, decoded);
  }

  return through2.obj(transform);
}

function _accumulate() {
  var header;
  var nonmgrhdr = false;

  function transform(data, enc, cb) {
    debug("_accumulate", data.toString('hex'));

    if (!nonmgrhdr) {

      if(data.length < 8){
        return cb(new Error("Newtmgr request buffer too small"));
      }
      var _header = _deserialize(data);
      if(_header && (_header.Op === CONSTANTS.NMGR_OP_READ_RSP || _header.Op ===CONSTANTS.NMGR_OP_WRITE_RSP)){
        header = _header;
      }
    }

    if(typeof header !== 'undefined'){
      if(nonmgrhdr){
        header.Data = Buffer.concat([header.Data, data])
      }

      if(header.Data.length >= header.Len){
        this.push(header);
        header = undefined;
        nonmgrhdr = false;
      }else{
        nonmgrhdr = true;
      }
    }
    return cb();
  }

  return through2.obj(transform);
}


function _deserialize(serializedBuffer){
  nmr = {};
  nmr.Op = serializedBuffer.readUInt8(0);
  nmr.Flags = serializedBuffer.readUInt8(1);
  nmr.Len = serializedBuffer.readUInt16BE(2);
  nmr.Group = serializedBuffer.readUInt16BE(4);
  nmr.Seq = serializedBuffer.readUInt8(6);
  nmr.Id = serializedBuffer.readUInt8(7);
  nmr.Data = serializedBuffer.slice(8);
  return nmr;
}


module.exports = {generateTestBuffer, generateConfirmBuffer, generateListBuffer, generateResetBuffer, decode, _serialize, _deserialize, _accumulate, _decode};
