var VERSION = "0.1.0";

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

  if ( /WebmakerMetrics(?::|:\s|\s)ping(\w\s)*/i.test( data.message ) ) {
    client.say( data.receiver, "Hello " + data.sender + ". I'm not a real person, I just log channel messages. The logs are used to generate metrics data for the Webmaker dashboard." );
  } else if ( /WebmakerMetrics(?::|:\s|\s)!version/i.test( data.message ) ) {
    client.say( data.receiver, "This is WebmakerMetrics bot v" + VERSION );
  }
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
