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

            try{creep.memory.building.valueOf();}
            catch(e){creep.memory.building = false;}

            try{creep.memory.repair_id.valueOf();}
            catch(e){creep.memory.repair_id = false;}


            // Creep Code ------------------------------------------------------
            try
            {
                let construction_sites = spawn.room.find(FIND_CONSTRUCTION_SITES);

                // before building, check if creep has energy


                if( (creep.store[RESOURCE_ENERGY] < (creep.store.getCapacity(RESOURCE_ENERGY) - 10) && creep.memory.building === false &&
                   !creep.memory.repair_id) || creep.store[RESOURCE_ENERGY] === 0)
                {
                    if(Object.keys(Game.creeps).length < 5){return;}


                    if(spawn.room.storage && creep.withdraw(spawn.room.storage, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE)
                    {
                       creep.moveTo(spawn.room.storage);
                    }
                    else if(spawn.store[RESOURCE_ENERGY] === 300 && creep.withdraw(spawn, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE)
                    {
                       creep.moveTo(spawn);
                    }
                }
                else
                {
                    for (let siteName in construction_sites)
                    {
                        if(!(construction_sites[siteName].structureType === STRUCTURE_ROAD))
                        {
                            creep.memory.building = true;
                            if(creep.build(construction_sites[siteName]) === ERR_NOT_IN_RANGE)
                            {
                                creep.moveTo(construction_sites[siteName]);
                            }
                            if(creep.store[RESOURCE_ENERGY] === 0)
                            {
                                creep.memory.building = false;
                            }
                            return;
                        }

                    }

                    // repair

                    let to_repair = creep.pos.findClosestByRange(
                        FIND_STRUCTURES, {
                            filter: function(object){return object.structureType !== STRUCTURE_ROAD && (object.hits < object.hitsMax / 2);
                        }
                    });

                    if(to_repair && creep.memory.repair_id === false)
                    {
                        creep.memory.repair_id = to_repair.id;
                    }

                    if(creep.memory.repair_id)
                    {
                        to_repair = Game.getObjectById(creep.memory.repair_id);

                        if(!(to_repair.structureType === STRUCTURE_WALL) &&
                           creep.repair(to_repair) === ERR_NOT_IN_RANGE)
                        {
                            creep.moveTo(to_repair);
                        }
                        if(creep.store[RESOURCE_ENERGY] === 0)
                        {
                            creep.memory.building = false;
                        }
                        if(to_repair.hits > to_repair.hitsMax - 200)
                        {
                            creep.memory.repair_id = false;
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

        // only spawn constructor, if there are at least 7 other creeps
        if(builder_creeps < total_creep_count && Object.keys(Game.creeps).length > 7)
        {
            let parts = [CARRY, CARRY, CARRY, WORK, MOVE, CARRY, WORK, MOVE, CARRY, CARRY, WORK, CARRY, CARRY, WORK, MOVE,
                CARRY, CARRY, WORK, CARRY, CARRY, WORK, MOVE, CARRY, CARRY, MOVE, CARRY, WORK, MOVE, CARRY, WORK, MOVE];
            let part_length = Object.keys(parts).length - 1;

            for (let i = 0; i < part_length; i++)
            {
                let success = spawn.spawnCreep(parts, spawn.name + '-' + 'Constructor' + '-' + Game.time);
                if(success === OK){console.log("Spawning Constructor: ", parts);return;}
                if(success === ERR_NOT_ENOUGH_ENERGY){parts.pop();}
                if(success === ERR_BUSY){return;}
                if(parts.length < 5){return;}
            }
        }
    }
};
