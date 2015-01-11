m3u8adskipper
=============

This Node module identifies ads in m3u8 HLS playlists and transmuxes the video into the mp4 container, skipping ads, without transcoding the content.

Usage
=====

It is super simple to use.

First download the m3u8 playlist using the m3u8downloader

using the following

```javascript
'use strict';
var m3u8adskipper = require('./');
var skipper = new m3u8adskipper('./adestination/m3u8absolute/index.m3u8', 'output.mp4');

skipper.run(function(err)
{
    if (err)
    {
        console.log(err);
    }
    else
    {
        console.log('done');
    }
});

skipper.on('error', function(err)
{
    console.error(err);
});

skipper.on('progress', function(d)
{
    console.log(d);
});

skipper.on('complete', function()
{
    console.log('transmux complete');
});
```
