/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('room');
 * mod.thing == 'a thing'; // true
 console.log();
 */

module.exports =
{
    run(spawn)
    {
        let sources = spawn.room.find(FIND_SOURCES);
        let total_creep_count = Object.keys(sources).length * 1.5;

        for(let name in Game.creeps)
        {
            if (!name.includes("Miner_carrier")){continue;}
            let creep = Game.creeps[name];

            try{creep.memory.collecting;}
            catch(e){creep.memory.collecting = true;}


            if(creep.memory.collecting)
            {
                // first check if sources are dropped
                /*let dropped_energy = creep.pos.findClosestByRange(FIND_DROPPED_RESOURCES, {
                    filter: (dropped_energy) => dropped_energy.resourceType === RESOURCE_ENERGY
                });*/

                // get largest dropped stack
                let dropped_energy = false;
                let dropped = spawn.room.find(FIND_DROPPED_RESOURCES);

                // prevent deadlocks
                if (!dropped){creep.memory.collecting = false;}

                for (let i in dropped)
                {
                    if (dropped[i].resourceType === "energy")
                    {
                        if(!dropped_energy || dropped[i].amount > dropped_energy.amount)
                        {
                            dropped_energy = dropped[i];
                        }
                    }
                }

                if(creep.pickup(dropped_energy) === ERR_NOT_IN_RANGE)
                {
                    creep.moveTo(dropped_energy);
                }
                if(creep.carry[RESOURCE_ENERGY] === creep.carryCapacity)
                {
                    creep.memory.collecting = false;
                }
            }
            // deliver energy
            else
            {

                if(spawn.store[RESOURCE_ENERGY] < spawn.store.getCapacity(RESOURCE_ENERGY))
                {
                    if(creep.transfer(spawn, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE)
                    {
                       creep.moveTo(spawn);
                    }
                }
                else if(spawn.room.storage && spawn.room.storage.store.getFreeCapacity() > 500)
                {
                    if(creep.transfer(spawn.room.storage, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE)
                    {
                       creep.moveTo(spawn.room.storage);
                    }
                }

                if (creep.carry[RESOURCE_ENERGY] === 0)
                {
                    creep.memory.collecting = true;
                }
            }
        }



        let current_creeps = 0;
        for (let name in Game.creeps)
        {
            if (name.includes('Miner_carrier')) { current_creeps++;}
        }
        if(Object.keys(Game.creeps).toString().includes("Miner-") && current_creeps < total_creep_count)
        {
            let parts = [MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, CARRY, CARRY, MOVE, CARRY,
                CARRY, MOVE, CARRY, CARRY, MOVE, CARRY, CARRY, MOVE, CARRY, CARRY, MOVE, CARRY, CARRY];
            let part_length = Object.keys(parts).length - 1;

            for (let i = 0; i < part_length; i++)
            {
                let success = spawn.spawnCreep(parts, spawn.name + '-' + 'Miner_carrier' + '-' + Game.time);
                if(success === OK){console.log("Spawning Miner Carrier: ", parts);return;}
                if(success === ERR_NOT_ENOUGH_ENERGY){parts.pop();}
                if(success === ERR_BUSY){return;}
                if(parts.length < 6){return;}
            }

        }

    }

};
