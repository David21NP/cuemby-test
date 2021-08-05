// imports node fetch for get remote servers data
const fetch = require('node-fetch');
// import a cli progress var for know were the fetching and uploading progress is
const cliProgress = require('cli-progress');
// imports a Mongodb client for nodejs
const { MongoClient } = require('mongodb');

// Get db URL from enviroment vars
const mongoUrl = `${process.env.ME_CONFIG_MONGODB_URL}cuemby`;

// cli styling
console.log('Begin');

const bar1 = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
const bar2 = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
const bar3 = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);

let fetchedPlayers = [];

/**
 * 
 * @param {Array} originalArray Array to remove duplicates
 * @param {key} prop key of the objects inside the Array
 * @returns The array without the duplicates of the key AKA smae players repeted removed
 */
function removeDuplicates(originalArray, prop) {
  var newArray = [];
  var lookupObject  = {};

  for(var i in originalArray) {
     lookupObject[originalArray[i][prop]] = originalArray[i];
  }

  for(i in lookupObject) {
      newArray.push(lookupObject[i]);
  }
   return newArray;
}


/**
 * async function that will be handling the fetching and upload process
 */
const fetchAll = async() => {

  /**
   * Async function for get the total of pages in the easports api
   * @returns Promise that contains the total pages that the easports api has
   */
  const getPages = async() => {
    const json = await fetch('https://www.easports.com/fifa/ultimate-team/api/fut/item?page=1').then(res => res.json()).catch(err => console.log(err));
    return json.totalPages;
  }
  let totalPages = await getPages();  

  /**
   * Delay function for not spaming easports api
   * @param {number} ms Integer that defines the number of miliseconds the delay will wait
   * @returns 
   */
  const delayFetch = async(ms) => {
    return new Promise((resolve) => {
      setTimeout(resolve, ms)
    });
  }

  // Loading bar 1
  bar1.start(totalPages, 0);
  
  /**
   * Loop for fetch all the pages in easports api
   * Saved all in an array of Promises
   */
  const responses = [];
  for (let index = 1; index <= totalPages; index++) {
    bar1.update(index);
    const fet = fetch(`https://www.easports.com/fifa/ultimate-team/api/fut/item?page=${index}`);
    responses.push(fet);
    await delayFetch(index % 10 !== 0 ? 100 : 200);
  }
  bar1.stop();

  // Await all the promises of fetching for get the data
  const jsons = await Promise.all((await Promise.all(responses)).map(res => res.json()));

  // Slice the just players info
  const players = [];
  for (const el of jsons) {
    players.push(...el.items);
  }

  // Sort the players based on the player baseId an unique id for each player
  players.sort((f, s) => {f.baseId - s.baseId});

  // Remove duplicated players in the array
  const playersNotRepeat = removeDuplicates(players, 'baseId');
  
  // cli styling
  console.log("");

  // Loading bar 2
  bar2.start(playersNotRepeat.length, 1);

  /**
   * For loop for get just the necesary players info
   * Name
   * Position
   * Nation
   * Team
   */
  let i = 1;
  for (const player of playersNotRepeat) {
    fetchedPlayers.push({
      name: player.commonName === '' ? `${player.firstName} ${player.lastName}` : player.commonName,
      position: player.position,
      nation: player.nation.name,
      team: player.club.name
    });
    bar2.update(i++);
  }
  bar2.stop();

  // cli styling
  console.log("");
  console.log('Done fetch');
  console.log("");

  return fetchedPlayers;
}


/**
 * Run the fetching function and resolve it promise
 * Upload data to db in the resolved promise
 */
fetchAll().then(fetP => {
  // cli styling
  console.log("");
  console.log('begin upload to db');
  console.log("");
  
  MongoClient.connect(mongoUrl, function (err, client) {
    // In case mongodb conection fails
    if (err) {
      throw err;
    }
  
    // Get the database to work
    let db = client.db('cuemby');
  
    // Loading bar 3
    bar3.start(1, 0);
  
    // Insert Players to db in collection players
    db.collection('players').insertMany(fetchedPlayers).then(result => {
      // Runs if successfull


      bar3.update(1);
      bar3.stop();
    
      // cli styling
      console.log("");
      console.log('Done upload');
      console.log("");

      process.exit(0);
    }, rejected => {
      // Runs if rejected



      // cli styling
      console.log("");
      console.log(rejected);
      console.log("");
    
      // cli styling
      console.log("");
      console.log('Upload rejected');
      console.log("");

      process.exit(-1);
    }).catch(err => {
      // Runs if error catched


      console.error(err);
      process.exit(-2);
    });
  })
});
