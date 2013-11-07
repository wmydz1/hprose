/**********************************************************\
|                                                          |
|                          hprose                          |
|                                                          |
| Official WebSite: http://www.hprose.com/                 |
|                   http://www.hprose.net/                 |
|                   http://www.hprose.org/                 |
|                                                          |
\**********************************************************/

/**********************************************************\
 *                                                        *
 * HproseWriter.js                                        *
 *                                                        *
 * HproseWriter for Node.js.                              *
 *                                                        *
 * LastModified: Nov 7, 2013                              *
 * Author: Ma Bingyao <andot@hprfc.com>                   *
 *                                                        *
\**********************************************************/

var util = require('util');
var HproseTags = require('./HproseTags.js');
var HproseSimpleWriter = require('./HproseSimpleWriter.js');

function HproseWriter(stream) {
    HproseSimpleWriter.call(this, stream);
    var reset = this.reset;
    if (typeof(Map) === 'undefined') {
        var ref = [];
        var writeRef = function(obj, checkRef, writeBegin, writeEnd) {
            var index;
            if (checkRef && ((index = ref.indexOf(obj)) >= 0)) {
                stream.write(HproseTags.TagRef);
                stream.write(index.toString());
                stream.write(HproseTags.TagSemicolon);
            }
            else {
                var result = writeBegin.call(this, obj);
                ref[ref.length] = obj;
                writeEnd.call(this, obj, result);
            }
        }
        this.reset = function() {
            reset();
            ref.length = 0;
        }
    }
    else {
        var ref = new Map();
        var refcount = 0;
        var writeRef = function(obj, checkRef, writeBegin, writeEnd) {
            var index;
            if (checkRef && ((index = ref.get(obj)) !== undefined)) {
                stream.write(HproseTags.TagRef);
                stream.write(index.toString());
                stream.write(HproseTags.TagSemicolon);
            }
            else {
                var result = writeBegin.call(this, obj);
                ref.set(obj, refcount++);
                writeEnd.call(this, obj, result);
            }
        }
        this.reset = function() {
            reset();
            ref = new Map();
            refcount = 0;
        }
    }
    function doNothing() {}
    var writeUTCDate = this.writeUTCDate;
    this.writeUTCDate = function(date, checkRef) {
        writeRef.call(this, date, checkRef, doNothing, writeUTCDate);
    }
    var writeDate = this.writeDate;
    this.writeDate = function(date, checkRef) {
        writeRef.call(this, date, checkRef, doNothing, writeDate);
    }
    var writeTime = this.writeTime;
    this.writeTime = function(time, checkRef) {
        writeRef.call(this, time, checkRef, doNothing, writeTime);
    }
    var writeString = this.writeString;
    this.writeString = function(str, checkRef) {
        writeRef.call(this, str, checkRef, doNothing, writeString);
    }
    var writeList = this.writeList;
    this.writeList = function(list, checkRef) {
        writeRef.call(this, list, checkRef, doNothing, writeList);
    }
    var writeMap = this.writeMap;
    this.writeMap = function(map, checkRef) {
        writeRef.call(this, map, checkRef, doNothing, writeMap);
    }
    this.writeObject = function(obj, checkRef) {
        writeRef.call(this, obj, checkRef, this.writeObjectBegin, this.writeObjectEnd);
    }
}

module.exports = HproseWriter;