#!/usr/bin/env node

var program = require( 'commander' )
var path = require( 'path' )
var get = require( '../lib/get' )

var log = console.log

program
    .usage( '<owner/repos/path> [dest]' )
    .parse( process.argv )

var source = program.args[ 0 ]
var rawName = program.args[ 1 ]
var dest = ( !rawName || rawName === '.' ) ? './' : rawName
console.log( dest )
var clone = program.clone || false

var info = parseSource( source );

if ( !info ) {
    log( 'Error: parameter is illegal.' );
    log();
    log( 'Usage:' )
    log( 'dgit <owner/repos/path> [dest]' );
    return;
}

get( info.owner, info.repo,  normalize( info.path ), normalize( dest ) )

function parseSource( path ) {
    var result;

    if ( !( result = /^((\S+):)?([\w-]+)\/([\w-]+)(\/([\w-\/]*))?(#(\S+))?$/.exec( path ) ) ) return null;

    return {
        origin: result[ 2 ] || 'github',
        owner: result[ 3 ],
        repo: result[ 4 ],
        path: result[ 6 ] || '/',
        ref: result[ 8 ]
    }
}

function normalize( source ) {
    if ( !/(\S)*\.\w+$/.test( source ) && source.charAt( source.length - 1 ) !== '/' ) {
        source += '/'
    }
    return source;
}