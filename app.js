var VERSION = '0.1.0',
    PASSWORD = 'CHANGEME',
    USERNAME = 'WebmakerMetrics',
    REALNAME = 'USER';

var nodeIRC = require( 'node-irc' ),
    fs = require( 'fs' ),
    server = 'irc.mozilla.org',
    port = 6667,
    channels = [ '#popcorn', '#webmaker', '#mofodev', '#foundation', '#openbadges' ],
    logDir = 'logs/',
    pingRegex = new RegExp( USERNAME + '(?::|:\s|\s)ping(\w\s)*', 'i' ),
    versionRegex = new RegExp( USERNAME + '(?::|:\s|\s)!version', 'i' ),
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

  if ( pingRegex.test( data.message ) ) {
    client.say( data.receiver, 'Hello ' + data.sender + '. I\'m not a real person, I just log channel messages. The logs are used to generate metrics data for the Webmaker dashboard. PS: Computers rule, Humans drool.' );
  } else if ( versionRegex.test( data.message ) ) {
    client.say( data.receiver, 'This is WebmakerMetrics bot v' + VERSION + '. Visit https://github.com/cadecairos/webmaker-irc-stats for the source code.' );
  }
}

function connect() {
  client = new nodeIRC( server, port, USERNAME, REALNAME );
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
  if ( PASSWORD != 'CHANGEME' ) {
    client.say( 'nickserv', 'identify ' + PASSWORD );
  }
}

connect();
