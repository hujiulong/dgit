#!/usr/bin/env node
'use strict'

const program = require( 'commander' )
const path = require( 'path' )
const github = require( '../lib/github' )

const log = console.log

program
    .usage( '<owner/repo/path> [dest]' )
    .parse( process.argv )

const source = program.args[ 0 ]
const rawName = program.args[ 1 ]
const dest = ( !rawName || rawName === '.' ) ? './' : rawName
const clone = program.clone || false

const info = parseSource( source )

if ( !info ) {
    log( 'Error: parameter is illegal.' )
    log()
    log( 'Usage:' )
    log( '    dgit <owner/repo/path> [dest]' )
    log()
    return
}

github( info.owner, info.repo, info.ref, info.path, dest )

function parseSource( source ) {

    let result

    if ( !( result = /^((\S+):)?([\w-]+)\/([\w-\.]+)(\/([\w-\/]*))?(@(\S+))?$/.exec( source ) ) ) return null

    let path = result[ 6 ] || ''

    if ( path && path !== '' && path.charAt( path.length - 1 ) === '/' ) path = path.substring( 0, path.length - 1 )   // src/ -> src

    return {
        origin: result[ 2 ] || 'github',
        owner: result[ 3 ],
        repo: result[ 4 ],
        path,
        ref: result[ 8 ] || 'master'
    }

}