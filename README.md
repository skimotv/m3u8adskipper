m3u8adskipper
=============

This Node module identifies ads in m3u8 HLS playlists and transmuxes the video into the mp4 container, skipping ads, without transcoding the content.

Usage
=====

It is super simple to use.

First download the m3u8 playlist using the m3u8downloader

using the following

```javascript
ader = require('m3u8downloader');
m3u8downloader.download("http://www.nacentapps.com/m3u8/index.m3u8",
                        "destination2",
function(data,err)
{
    if(err)
        console.log(err);
    else
        console.log(data);
});
```

```javascript
var m3u8adskipper = require('./m3u8adskipper');
m3u8adskipper.skip('sdestination/m3u8/index.m3u8',false,"output.mp4",
function(data,err)
{
    if(err)
        console.log(err);
    else
        console.log(data);
});
```
