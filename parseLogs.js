var LOG_DIR = 'logs/',
    ONE_HOUR = 3600000,
    API_KEY = "API_KEY_HERE",
    COUNT_WIDGET_ID = "ID_HERE",
    LEADERBOARD_WIDGET_ID = "ID_HERE";

var fs = require( 'fs' ),
    ducksnode = require( 'ducksnode' ),
    logs = fs.readdirSync( LOG_DIR ),
    messageRegex = /^([^\s]+)\s([\d]+)\s([^\s].*)$/,
    parsedData = [],
    sortedByNick = {},
    logFileName,
    channelName,
    logData,
    metrics = {};

function sortByNick() {
  var data = parsedData.slice(),
      log;

  for ( var i = data.length - 1; i >= 0; i-- ) {
    log = data[ i ];
    if ( !sortedByNick[ log.nick ] ) {
      sortedByNick[ log.nick ] = 0;
    }
    sortedByNick[ log.nick ]++;
  }
}

function oneHourMessageCount() {
  var count = 0,
      data = parsedData.slice(),
      now = Date.now();

  for ( var i = data.length - 1; i >= 0; i-- ) {
    if ( now - data[ i ].date < ONE_HOUR ) {
      count++;
    }
  }

  return count;
}

function buildLeaderBoard() {
  var leaderBoard = {},
      board = [];

  for( var nick in sortedByNick ) {
    if ( sortedByNick.hasOwnProperty( nick ) ) {
      board.push({
        'name': nick,
        values: [ sortedByNick[ nick ] ]
      });
    }
  }

// console.log( board );
  board.sort(function( a, b ){
    return +a.values[ 0 ] - +b.values[ 0 ];
  }).reverse();

  leaderBoard.value = { 'board': board };

  return leaderBoard
}

function parseData( data, name ) {
  var regexResults = [],
      result,
      lineResult,
      nick,
      date,
      message;

  data = data.split( '\n' );

  for ( var i = data.length - 1; i >= 0; i-- ) {
    result = messageRegex.exec( data[ i ] );
    if ( result ) {
      regexResults.unshift( result );
    }
  }

  for ( var i = regexResults.length - 1; i >= 0; i-- ) {
    lineResult = regexResults[ i ];
    parsedData.unshift({
      nick: lineResult[ 1 ],
      date: new Date( +lineResult[ 2 ] ),
      message: lineResult[ 3 ]
    });
  }
}

for ( var i = logs.length - 1; i >= 0; i-- ) {
  logFileName = logs[ i ];
  channelName = logFileName.replace( '#', '' );
  logData = fs.readFileSync( LOG_DIR + logFileName, 'utf-8' );
  parseData( logData, channelName );
  sortByNick();
}

var options = {
  api_key: API_KEY
}

var request = ducksnode.create( options );

request.push( COUNT_WIDGET_ID, oneHourMessageCount() );
request.push( LEADERBOARD_WIDGET_ID, buildLeaderBoard() );
