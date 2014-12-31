// m3u8adskipper.js
// ================
var exec = require('child_process').exec;
var fs = require('fs');

exports.version = "0.1.0";

var endsWith = function(str, suffix) 
{
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
}

exports.skip = function(masterPlayListFile, skipAds, outputFile, callback)
{
    var res = masterPlayListFile.split("/");
    var rootDir = masterPlayListFile.replace(res[res.length-1],'');
    var content = "";
    try
    {
        content = fs.readFileSync(masterPlayListFile, 'utf-8'); 
    }
    catch(err)
    {
        callback("error: ", err);
    }
    var masterPlayListContents = content.split("\n");
    var removeURL = '';
    for(i in masterPlayListContents) 
    {
        if(endsWith(masterPlayListContents[i],"m3u8"))
        {
            var res2 = masterPlayListContents[i].split("/");
            var playListDir = rootDir + masterPlayListContents[i].replace(res2[res2.length-1],'');
            if (masterPlayListContents[i].indexOf("://") > -1)
            {
                removeURL = res2[0] + '//' + res2[1] + res2[2] + '/' + res2[3] + '/';
                masterPlayListContents[i] = masterPlayListContents[i].replace(removeURL,'');
            }
            var masterDir = masterPlayListContents[i].replace(res2[res2.length-1],'');
            try
            {
                content2 = fs.readFileSync(rootDir + masterPlayListContents[i], "utf-8"); 
            }
            catch(err)
            {
                callback('error:', err);
            }
            var mediaPlayListContents = content2.split("\n");
            var k = -1;
            var mediaSegments = new Array();
            var xMediaSegments = new Array();
            var yMediaSegments = new Array();
            var command = "ffmpeg -y -loglevel quiet -i ";
            var curDir = "";
            var currentStream = 0, adsPresent = false;
            for(j in mediaPlayListContents) 
            {
                if(endsWith(mediaPlayListContents[j],"ts"))
                {
                    k++;
                    var fileName = mediaPlayListContents[j].split("/");
                    if(skipAds)
                    {
                        if(currentStream == 0)
                        {
                            xMediaSegments[k] = rootDir + masterDir + fileName[fileName.length-1]; 
                        }
                        else
                        {
                            yMediaSegments[k] = rootDir + masterDir + fileName[fileName.length-1]; 
                        }
                        mediaSegments[k] = rootDir + masterDir + fileName[fileName.length-1]; 
                    }
                }
                else if(endsWith(mediaPlayListContents[j],"EXT-X-DISCONTINUITY"))
                {
                    callback("content transition from/to ads");
                    adsPresent = true;
                    if(currentStream == 0)
                        currentStream = 1;
                    else
                        currentStream = 0;
                }
                else if(endsWith(mediaPlayListContents[j],"ENDLIST"))
                {
                    currentStream = 0; 
                }
            }
            k = 0;
            var concatParam = '"concat:';
            if(adsPresent && skipAds)
            { 
                if(xMediaSegments.length > yMediaSegments.length)
                {
                    for(k in xMediaSegments)
                    {
                        if(k != 0)
                            concatParam += '|';
                        concatParam += xMediaSegments[k];
                    }
                }
                else
                {
                    for(k in yMediaSegments)
                    {
                        if(k != 0)
                            concatParam += '|';
                        concatParam += yMediaSegments[k];
                    }
                }
            }
            else
            {
                for(k in mediaSegments)
                {
                    if(k != 0)
                        concatParam += '|';
                    concatParam += mediaSegments[k];
                }
            }
            concatParam += '"';
            outputFileName = rootDir + masterDir + outputFile;
            if(concatParam != '"concat:"')
            {
                // the -bsf:a option is required for handling malformed aac bitstream
                // ==================================================================
                command += concatParam + ' -bsf:a aac_adtstoasc  -c copy -f mp4 ' + outputFileName;
                var child = exec(command, function(err, stdout, stderr)
                {
                    if (stderr) 
                        callback('error',stderr);
                    else
                        callback('successfully transmuxed ');
                });
            }
        }
    }
}
