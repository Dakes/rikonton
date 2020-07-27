module.exports.loop = function()
{
    // delete construction sites
    //let constructionSites = Game.spawns["Spawn"].room.find(FIND_CONSTRUCTION_SITES);
    //for (let siteName in constructionSites) {
    //    constructionSites[siteName].remove();
    //}

    let defenders = require("role.defender");
    let miners = require("role.miner");
    let constructors = require("role.constructor");
    let carriers = require("role.carrier");
    let miner_carriers = require("role.miner_carrier");
    let primitive_miners = require("role.primitive_miner");
    let upgrader = require("role.upgrader");

    let roads = require("road");
    let towers = require("tower");
    let structures = require("structures");


    for(let i in Game.rooms)
    {
        let room = Game.rooms[i];
        // get the first spawn in room
        let spawn = room.find(FIND_MY_SPAWNS)[0];

        defenders.run(spawn);
        primitive_miners.run(spawn);
        miners.run(spawn);
        miner_carriers.run(spawn);
        constructors.run(spawn);
        carriers.run(spawn);
        upgrader.run(spawn);

        roads.run(spawn);
        towers.run(spawn);
        structures.run(spawn);

    }

    for (let name in Memory.creeps)
    {
        if(!Game.creeps[name])
        {
            delete Memory.creeps[name];
        }
    }
    
    if(Game.cpu.bucket > 9000)
    {
        Game.cpu.generatePixel();
    }


}

