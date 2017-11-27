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

    const spinner = ora( `  donwloading from github:${ owner }/${ repo }/${ path }  ref: ${ ref }` )

    const pattern = new RegExp( '^' + path )
    const target = path.split( '/' ).pop()

    if ( path === '' ) dest = dest === '' ? repo : dest + '/' + repo

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
            spinner.stop()
            return
        }

        const data = JSON.parse( body )

        if ( !data.tree ) {
            error( 'Not Found.' )
            spinner.stop()
            return
        }

        const tree = data.tree.filter( item => pattern.test( item.path ) )

        if ( tree.length === 0 ) {
            error( 'Not Found.' )
            spinner.stop()
            return
        }

        let tasks = 0
        let count = 0
        let size = 0

        tree.map( item => {

            let destPath = item.path.replace( pattern, target );

            destPath =  dest === '' ? destPath : dest + '/' + destPath;

            if ( item.type === ITEM_TYPE.TREE ) {

                fs.mkdirsSync( destPath )

            } else if ( item.type === ITEM_TYPE.BLOB ) {

                size += item.size;
                tasks++

                downloadFile( owner, repo, ref, item.path, destPath, () => {

                    if ( count === 0 ) {
                        spinner.stopAndPersist( { text: `\n  github:${ owner }/${ repo }/${ path }  ref: ${ ref }\n` } )
                    }

                    count++
                    
                    spinner.succeed( item.path )
                    spinner.start( ' downloading...' )

                    if ( tasks === count ) {
                        spinner.stop();
                        log( chalk.green( '\n  Download complete.\n' ) )

                        const K = 1 << 10
                        const M = 1 << 20
                        const sizeStr = size < K ? size + ' B' : ( size < M ? ( size / K ).toFixed( 2 ) + ' KB' : ( size / M ).toFixed( 2 ) + ' MB' )

                        log( chalk.cyan( `  downloaded ${ tasks } files, totaling ${ sizeStr }.\n` ) )
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

function downloadFile( owner, repo, ref, repoPath, path, onComplete, onError, retryCount = 0 ) {

    const url = `https://raw.githubusercontent.com/${ owner }/${ repo }/${ ref }/${ repoPath }`

    const stream = fs.createWriteStream( path )

    request( url )
        .on( 'error', err => {
            if ( retryCount <= 2 ) {
                return downloadFile( owner, repo, ref, repoPath, path, onComplete, onError, retryCount + 1 )
            }
            onError( err )
        } )
        .on( 'response', function( res ) {
            if ( res.statusCode !== 200 ) {
                this.emit( 'error', res.statusMessage )
            }
        } )
        .pipe( stream )
        .on( 'close', onComplete )

}

module.exports = github
