var nodeIRC = require( 'node-irc' ),
    fs = require( 'fs' ),
    server = 'irc.mozilla.org',
    port = 6667,
    channels = [ '#popcorn', '#webmaker', '#mofodev', '#foundation', '#openbadges' ],
    logDir = 'logs/',
    client;

function logMessage( data ) {
  fs.appendFileSync(
    logDir + data.receiver,
    data.sender + ' ' + Date.now() + ' ' + data.message + '\n', 'utf-8',
    function( err ) {
      if ( err ) {
      console.log( err );
    }
  });
}

function connect() {
  client = new nodeIRC( server, port, 'WebmakerMetrics', 'Webmaker' );
  client.on( 'ready', joinChannels );
  client.on( 'CHANMSG', logMessage );
  client.on( 'close', connect );
  client.connect();
}

function joinChannels() {
  var name;

  for ( var i = channels.length - 1; i >= 0; i-- ) {
    name = channels[ i ];
    client.join( name );
  }
}

connect();
