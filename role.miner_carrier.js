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
        let total_creep_count = Object.keys(sources).length * 2;

        for(let name in Game.creeps)
        {
            if (!name.includes("Miner_carrier")){continue;}
            let creep = Game.creeps[name];

            try{creep.memory.collecting;}
            catch(e){creep.memory.collecting = true;}

            if(creep.memory.collecting)
            {
                // first check if sources are dropped
                let dropped_energy = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES)
                if(creep.pickup(dropped_energy) === ERR_NOT_IN_RANGE)
                {
                    creep.moveTo(dropped_energy);
                }
                if(creep.carry[RESOURCE_ENERGY] === creep.carryCapacity)
                {
                    creep.memory.collecting = false;
                }
            }
            else
            {
                if(spawn.energy < spawn.energyCapacity)
                {
                    if(creep.transfer(spawn, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE)
                    {
                       creep.moveTo(spawn);
                    }
                }
                if(spawn.room.storage && spawn.room.storage.store[RESOURCE_ENERGY] < spawn.room.storage.storeCapacity)
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
        if(current_creeps < total_creep_count)
        {
            spawn.spawnCreep([MOVE, CARRY, CARRY, CARRY, CARRY, CARRY],
            spawn.name + '-' + 'Miner_carrier' + '-' + Game.time);
        }

    }

};
