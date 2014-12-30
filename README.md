m3u8adskipper
=============

This Node module identifies ads in m3u8 HLS playlists and transmuxes the video into the mp4 container, skipping ads, without transcoding the content.

Usage
=====

It is super simple to use.

```javascript
var m3u8adskipper = require('./m3u8adskipper');
m3u8adskipper.skip('destination/m3u8/index.m3u8',false,"output.mp4",
                    function(data,err)
                    {
                        if(err)
                            console.log(err);
                        else
                            console.log(data);
                    });
```

