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
