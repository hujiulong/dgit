var request = require( 'request' )
var fs = require( 'fs-extra' )

var CLI_NAME = 'dgit'

var ITEM_TYPE = {
    DIR: 'dir',
    FILE: 'file',
    SYMLINE: 'symlink',
    SUBMODULE: 'submodule'
}

function get( owner, repo, path, dest ) {

    if ( dest && !fs.existsSync( dest ) ) {
        fs.mkdirsSync( dest );
    }

    var options = {
        url: 'https://api.github.com/repos/' + owner + '/' + repo + '/contents/' + path,
        headers: {
            'User-Agent': CLI_NAME
        }
    }

    request.get( options, function( err, res, body ) {

        if ( err ) {
            console.log( err );
            return;
        }

        var data = JSON.parse( body );

        if ( !Array.isArray( data ) ) {
            console.log( 'Error: https://api.github.com/repos' + owner + '/' + repo + '/contents/' + path )
            console.log( data );
            return;
        }

        data.map( function( item ) {

            if ( item.type === ITEM_TYPE.DIR ) {
                fs.mkdirsSync( dest + item.name );
                get( owner, repo, path + item.name + '/', dest + item.name + '/' )
            }

            if ( item.download_url ) {
                downloadFile( item.download_url, dest + item.name )
            }

        } );
    }, function( err ) {
        console.log( err )
    } )
}


function downloadFile( uri, filename ) {
    var stream = fs.createWriteStream( filename );
    request( uri ).pipe( stream ).on( 'close', function() {
        console.log( filename + ' done' )
    } );
}

module.exports = get;