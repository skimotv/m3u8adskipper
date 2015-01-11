m3u8adskipper
=============

This Node module identifies ads in m3u8 HLS playlists and transmuxes the video into the mp4 container, skipping ads, without transcoding the content.

Usage
=====

It is super simple to use.

First download the m3u8 playlist using the m3u8downloader

using the following

```javascript
var m3u8downloader = require('m3u8downloader');
var m3u8adskipper = require('./');
var downloader = new m3u8downloader(""http://www.nacentapps.com/m3u8/index.m3u8"", "destination",
function(err, data)
{
    if(err)
        console.log(err);
    else
        console.dir(data)
});

downloader.on('start', function()
{
    console.log("started downloading");
});

downloader.on('progress', function(d)
{
    console.log(d);
});


downloader.on('downloaded', function(d)
{
    console.log(d);
});


downloader.on('complete', function(d)
{
    console.log('done');
    var skipper = new m3u8adskipper('destination/m3u8absolute/index.m3u8',"output.mp4",
    function(data,err)
    {
        if(err)
            console.log(err);
        else
            console.log(data);
    });

    skipper.on('progress', function(d)
    {
        console.log(d);
    });

    skipper.on('complete', function(d)
    {
        console.log(d);
    });
});
```
