// m3u8adskipper.js
// ================
'use strict';
var async = require('async');
var EventEmitter = require('events').EventEmitter;
var exec = require('child_process').exec;
var fs = require('fs');
var path = require('path');
var util = require('util');
exports.version = '0.2.1';

function endsWith(str, suffix) 
{
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
}

var m3u8adskipper = function(masterPlayListFile, outputFile) 
{
    var self = this;
    this.run = function(callback) 
    {
        var res = masterPlayListFile.split('/');
        var rootDir = masterPlayListFile.replace(res[res.length - 1], '');
        var content;
        try 
        {
            content = fs.readFileSync(masterPlayListFile, 'utf-8');
        }
        catch (err) 
        {
            return callback('error: ', err);
        }
        var masterPlayListContents = content.split('\n');
        var removeURL = '';
        async.eachSeries(masterPlayListContents, handlePart, done);
        function handlePart(part, asyncCb) 
        {
            if (!endsWith(part, 'm3u8')) 
            {
                return asyncCb();
            }
            var res2 = part.split('/');
            if (part.indexOf("://") > -1) 
            {
                removeURL = res2[0] + '//' + res2[1] + res2[2] + '/' + res2[3] + '/';
                part = part.replace(removeURL, '');
            }
            var masterDir = part.replace(res2[res2.length - 1], '');
            var content;
            try 
            {
                content = fs.readFileSync(rootDir + part, 'utf8');
            }
            catch (err) 
            {
                return asyncCb(err);
            }
            var mediaPlayListContents = content.split("\n");
            var k = -1;
            var mediaSegments = [];
            var xMediaSegments = [];
            var yMediaSegments = [];
            var command = 'ffmpeg -y -loglevel quiet -i ';
            var currentStream = 0, adsPresent = false;
            var j;
            for (j in mediaPlayListContents) 
            {
                if (!mediaPlayListContents.hasOwnProperty(j)) 
                {
                    continue;
                }
                if (endsWith(mediaPlayListContents[j], 'ts')) 
                {
                    k++;
                    var fileName = mediaPlayListContents[j].split('/');
                    if (currentStream == 0) 
                    {
                        xMediaSegments[k] = rootDir + masterDir + fileName[fileName.length - 1];
                    }
                    else 
                    {
                        yMediaSegments[k] = rootDir + masterDir + fileName[fileName.length - 1];
                    }
                    mediaSegments[k] = rootDir + masterDir + fileName[fileName.length - 1];
                }
                else if (endsWith(mediaPlayListContents[j], 'EXT-X-DISCONTINUITY')) 
                {
                    self.emit('progress', 'content transition from/to ads');
                    adsPresent = true;
                    if (currentStream == 0) 
                    {
                        currentStream = 1;
                    }
                    else 
                    {
                        currentStream = 0;
                    }
                }
                else if (endsWith(mediaPlayListContents[j], 'ENDLIST')) 
                {
                    currentStream = 0;
                }
            }
            var m;
            var concatParam = '"concat:';
            if (adsPresent) 
            {
                self.emit('progress', 'ads present in the video');
                if (xMediaSegments.length > yMediaSegments.length) 
                {
                    for (m in xMediaSegments) 
                    {
                        if (!xMediaSegments.hasOwnProperty(m)) 
                        {
                            continue;
                        }
                        if (m != 0) 
                        {
                            concatParam += '|';
                        }
                        concatParam += xMediaSegments[m];
                    }
                }
                else 
                {
                    for (m in yMediaSegments) 
                    {
                        if (!yMediaSegments.hasOwnProperty(m)) 
                        {
                            continue;
                        }
                        if (m != 0) 
                        {
                            concatParam += '|';
                        }
                        concatParam += yMediaSegments[m];
                    }
                }
            }
            else 
            {
                self.emit('progress', 'ads not present in the video');
                for (m in mediaSegments) 
                {
                    if (!mediaSegments.hasOwnProperty(m)) 
                    {
                        continue;
                    }
                    if (m != 0) 
                    {
                        concatParam += '|';
                    }
                    concatParam += mediaSegments[m];
                }
            }
            concatParam += '"';
            var outputFileName = path.join(rootDir, masterDir, outputFile);
            if (concatParam != '"concat:"') 
            {
                // the -bsf:a option is required for handling malformed aac bitstream
                // ==================================================================
                command += concatParam + ' -bsf:a aac_adtstoasc  -c copy -f mp4 ' + outputFileName;
                exec(command, function(err, stdout, stderr) 
                {
                    if (err)  
                    {
                        asyncCb(err);
                    }
                    else if (stderr) 
                    {
                        asyncCb(new Error('ffmpeg error: ' + stderr));
                    }
                    else 
                    {
                        asyncCb();
                    }
                });
            }
            else 
            {
                asyncCb()
            }
        }
        function done(err) 
        {
            if (err) 
            {
                self.emit('error', err);
                callback(err);
            }
            else 
            {
                self.emit('complete');
                callback(null);
            }
        }
    };
};
util.inherits(m3u8adskipper, EventEmitter);
module.exports = m3u8adskipper;
