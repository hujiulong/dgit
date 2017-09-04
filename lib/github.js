'use strict'

const request = require( 'request' )
const fs = require( 'fs-extra' )

const APP_NAME = 'dgit'

const ITEM_TYPE = {
    TREE: 'tree',
    BLOB: 'blob'
}

function github( owner, repo, ref, path, dest ) {

    const pattern = new RegExp( '^' + path, 'i' )

    const url = `https://api.github.com/repos/${ owner }/${ repo }/git/trees/${ ref }?recursive=1`

    if ( !fs.existsSync( dest ) ) fs.mkdirsSync( dest )

    const options = {
        url,
        headers: {
            'User-Agent': APP_NAME
        }
    }

    request.get( options, ( err, res, body ) => {

        if ( err ) {
            console.error( 'Error: ' )
            console.error( err )
            return
        }

        const data = JSON.parse( body )

        if ( !data.tree ) {
            console.error( 'Error: Not Found' )
            return
        }

        const tree = data.tree.filter( item => pattern.test( item.path ) )

        if ( tree.length === 0 ) {
            console.error( 'Error: No such file or directory' )
            return
        }

        tree.map( item => {

            if ( item.type === ITEM_TYPE.TREE ) {

                fs.mkdirsSync( dest + '/' + item.path )

            } else if ( item.type === ITEM_TYPE.BLOB ) {

                downloadFile( owner, repo, ref, item.path, dest + '/' + item.path )

            }
        } )

    }, err => {

        console.error( 'Error:' )
        console.error( err )

    } )

}

function downloadFile( owner, repo, ref, repoPath, path ) {

    const url = `https://raw.githubusercontent.com/${ owner }/${ repo }/${ ref }/${ repoPath }`

    const stream = fs.createWriteStream( path )

    request( url ).pipe( stream ).on( 'close', function() {
        console.log( repoPath + ' done' )
    } )

}

module.exports = github