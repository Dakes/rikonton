module.exports.loop = function()
{
    // delete construction sites
    //let constructionSites = Game.spawns["Spawn"].room.find(FIND_CONSTRUCTION_SITES);
    //for (let siteName in constructionSites) {
    //    constructionSites[siteName].remove();
    //}

    let defenders = require("role.defender");
    let constructors = require("role.constructor");
    let carriers = require("role.carrier");
    let miners = require("role.miner");
    let miner_carriers = require("role.miner_carrier");
    let primitive_miners = require("role.primitive_miner");

    let roads = require("road");
    let towers = require("tower");
    let structures = require("structures");



    defenders.run(Game.spawns["Spawn"]);
    primitive_miners.run(Game.spawns["Spawn"]);
    miners.run(Game.spawns["Spawn"]);
    miner_carriers.run(Game.spawns["Spawn"]);
    constructors.run(Game.spawns["Spawn"]);
    carriers.run(Game.spawns["Spawn"]);

    roads.run(Game.spawns["Spawn"]);
    towers.run(Game.spawns["Spawn"]);
    structures.run(Game.spawns["Spawn"]);



    for (let name in Memory.creeps)
    {
        if(!Game.creeps[name])
        {
            delete Memory.creeps[name];
        }
    }

}

