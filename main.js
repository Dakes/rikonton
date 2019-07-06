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
    let rooms = require("room");
    let roads = require("road");
    let towers = require("tower");

    defenders.run(Game.spawns["Spawn"]);
    rooms.run(Game.spawns["Spawn"]);
    roads.run(Game.spawns["Spawn"]);
    towers.run(Game.spawns["Spawn"]);
    constructors.run(Game.spawns["Spawn"]);
    carriers.run(Game.spawns["Spawn"]);




    for (let name in Memory.creeps)
    {
        if(!Game.creeps[name])
        {
            delete Memory.creeps[name];
        }
    }

}

