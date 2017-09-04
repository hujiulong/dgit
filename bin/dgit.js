#!/usr/bin/env node

const program = require( 'commander' )
const path = require( 'path' )
const get = require( '../lib/get' )

const log = console.log

program
    .usage( '<owner/repos/path> [dest]' )
    .parse( process.argv )

const source = program.args[ 0 ]
const rawName = program.args[ 1 ]
const dest = ( !rawName || rawName === '.' ) ? './' : rawName
const clone = program.clone || false

const info = parseSource( source );

if ( !info ) {
    log( 'Error: parameter is illegal.' );
    log();
    log( 'Usage:' )
    log( 'dgit <owner/repos/path> [dest]' );
    return;
}

get( info.owner, info.repo,  normalize( info.path ), normalize( dest ) )

function parseSource( path ) {
    let result;

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