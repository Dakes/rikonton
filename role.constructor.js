/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('road');
 * mod.thing == 'a thing'; // true
 */

module.exports = {
    run(spawn)
    {

        let total_creep_count = 1;
        for(let name in Game.creeps)
        {
            if (!name.includes("Constructor")) {continue;}
            let creep = Game.creeps[name];


            // Creep Code ------------------------------------------------------
            try
            {
                let constSites = spawn.room.find(FIND_CONSTRUCTION_SITES);

                // before building, check if creep has energy


                if(creep.carry[RESOURCE_ENERGY] < (creep.carryCapacity - 10) && creep.memory.building === false)
                {
                    if(Object.keys(Game.creeps).length < 5){return;}


                    if(creep.withdraw(spawn, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE)
                    {
                       creep.moveTo(spawn);
                    }
                    else
                    {
                        if(creep.carry[RESOURCE_ENERGY] < (creep.carryCapacity - 10))
                        {

                        }
                    }
                }
                else
                {
                    for (let siteName in constSites)
                    {
                        if(!(constSites[siteName].structureType === "road"))
                        {
                            creep.memory.building = true;
                            if(creep.build(constSites[siteName]) === ERR_NOT_IN_RANGE)
                            {
                                creep.moveTo(constSites[siteName]);
                            }
                            if(creep.carry[RESOURCE_ENERGY] === 0)
                            {
                                creep.memory.building = false;
                            }
                            return;
                            break;
                        }

                    }

                    // repair

                    let to_repair = creep.pos.findClosestByRange(
                        FIND_STRUCTURES, {
                            filter: function(object){return !(object.structureType === STRUCTURE_ROAD) && (object.hits < object.hitsMax / 2);
                        }
                    });

                    if(to_repair)
                    {
                        if(creep.repair(to_repair) === ERR_NOT_IN_RANGE)
                        {
                            creep.moveTo(to_repair);
                        }
                    }
                    // nothing to repair, move to idle position
                    else
                    {
                        // TODO: automate idle position
                        creep.moveTo(creep.room.getPositionAt(35, 35));
                    }


                }
            }
            catch(e)
            {
                console.log("error in constructor");
                console.log(e);
                creep.memory.building = false;
            }
            //Game.creeps[name].ConstructionSite.

            // end first for
        }


        // Generate new road_constructor creep
        let builder_creeps = 0;
        for (let name in Game.creeps)
        {
            if (name.includes('Constructor')) { builder_creeps++;}
        }

        // only spawn road constructor, if there are at least 5 other creeps and no road constructor
        if(builder_creeps < total_creep_count && Object.keys(Game.creeps).length > 7)
        {
            spawn.spawnCreep([CARRY, CARRY, CARRY, WORK, MOVE],
            spawn.name + '-' + 'Constructor' + '-' + Game.time);
        }

        for (let name in Memory.creeps)
        {
            if(!Game.creeps[name])
            {
                delete Memory.creeps[name];
            }
        }



    }
};
