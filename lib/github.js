'use strict'

const request = require( 'request' )
const fs = require( 'fs-extra' )
const ora = require( 'ora' )
const chalk = require( 'chalk' )

const APP_NAME = 'dgit'

const ITEM_TYPE = {
    TREE: 'tree',
    BLOB: 'blob'
}

const log = console.log

const error = text => {
    log( chalk.red( '\n  Error:\n' ) )
    log( chalk.red( `  ${ text }\n` ) )
}

function github( owner, repo, ref, path, dest ) {

    const spinner = ora( `  donwloading form github:${ owner }/${ repo }/${ path }@${ ref }` )

    const pattern = new RegExp( '^' + path, 'i' )

    const url = `https://api.github.com/repos/${ owner }/${ repo }/git/trees/${ ref }?recursive=1`

    if ( !fs.existsSync( dest ) ) fs.mkdirsSync( dest )

    const options = {
        url,
        headers: {
            'User-Agent': APP_NAME
        }
    }

    spinner.start()

    request.get( options, ( err, res, body ) => {

        if ( err ) {
            error( err.toString() )
            return
        }

        const data = JSON.parse( body )

        if ( !data.tree ) {
            error( 'Not Found.' )
            return
        }

        const tree = data.tree.filter( item => pattern.test( item.path ) )

        if ( tree.length === 0 ) {
            error( 'Not Found.' )
            return
        }

        let tasks = 0
        let count = 0
        let size = 0

        tree.map( item => {

            if ( item.type === ITEM_TYPE.TREE ) {

                fs.mkdirsSync( dest + '/' + item.path )

            } else if ( item.type === ITEM_TYPE.BLOB ) {

                size += item.size;
                tasks++

                downloadFile( owner, repo, ref, item.path, dest + '/' + item.path, () => {

                    if ( count === 0 ) {
                        spinner.stopAndPersist( { text: `\n  github:${ owner }/${ repo }/${ path }@${ ref }:\n` } )
                    }

                    count++
                    
                    spinner.succeed( item.path )

                    if ( tasks === count ) {
                        spinner.stop();
                        log( chalk.green( '\n  Download complete.\n' ) )
                        log( chalk.cyan( `  downloaded ${ tasks } files for ${ ( size / 1024 ).toFixed( 2 ) } kb.\n` ) )
                    }

                }, err => {
                    
                    spinner.fail( item.path )

                } )

            }
        } )

    }, err => {

        error( err )

    } )

}

function downloadFile( owner, repo, ref, repoPath, path, onComplete, onError ) {

    const url = `https://raw.githubusercontent.com/${ owner }/${ repo }/${ ref }/${ repoPath }`

    const stream = fs.createWriteStream( path )

    request( url )
        .on( 'error', onError )
        .pipe( stream )
        .on( 'close', onComplete )

}

module.exports = github