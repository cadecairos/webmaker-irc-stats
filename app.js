var nodeIRC = require( '../node-irc/lib/client.js' ),
    request = require( 'http' ).request,
    server = 'irc.mozilla.org',
    port = 6667,
    channels = [ 'webmaker-test-channel', "webmaker-test-channel2" ],
    channelStats = {},
    startUp = Date.now(),
    host = 'http://requestb.in/1ahm5tf1',
    client;

function connect() {
  client = new nodeIRC( server, port, 'WebmakerMetrics', 'Webmaker' );
  client.on( 'ready', joinChannels );
  client.debug = true;
  client.connect();
}

function joinChannels() {
  var name;

  for ( var i = channels.length - 1; i >= 0; i-- ) {
    name = channels[ i ];
    channelStats[ name ] = {};
    channelStats[ name ].messageCount = 0;
    client.join( '#' + name );
  }

  client.on( 'CHANMSG', function( data ) {
    var channel = data.receiver.substring( 1, data.receiver.length );
    channelStats[ channel ].messageCount += 1;
  });

  function doPost() {
    request.post( host, {
      form: channelStats
    });
  }

  setInterval( doPost, 10000 );
}

connect();