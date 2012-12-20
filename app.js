var VERSION = '0.1.0',
    PASSWORD = 'CHANGEME',
    USERNAME = 'WebmakerMetrics',
    REALNAME = 'USER';

var irc = require( 'irc' ),
    fs = require( 'fs' ),
    server = 'irc.mozilla.org',
    port = 6667,
    channels = [ '#popcorn', '#webmaker', '#mofodev', '#foundation', '#openbadges' ],
    logDir = 'logs/',
    pingRegex = new RegExp( USERNAME + '(?::|:\\s|\\s)ping(\\w\\s)*', 'i' ),
    versionRegex = new RegExp( USERNAME + '(?::|:\\s|\\s)!version', 'i' ),
    client;

function logMessage( nick, to, text ) {
  fs.appendFileSync(
    logDir + to,
    nick + ' ' + Date.now() + ' ' + text + '\n', 'utf-8',
    function( err ) {
      if ( err ) {
      console.log( err );
    }
  });

  if ( pingRegex.test( text ) ) {
    client.say( to, 'Hello ' + nick + '. I\'m not a real person, I just log channel messages. The logs are used to generate metrics data for the Webmaker dashboard. PS: Computers rule, Humans drool.' );
  }
}

function connect() {
  client = new irc.Client( server, USERNAME, {
    port: port,
    autoConnect: false
  });
  client.on( 'registered', joinChannels );
  client.on( 'message#', logMessage );
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
