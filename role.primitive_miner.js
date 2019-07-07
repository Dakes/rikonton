module.exports =
{
    run(spawn)
    {
        let total_creep_count = 5;

        let sources = spawn.room.find(FIND_SOURCES);


        for(let name in Game.creeps)
        {
            if (!name.includes("Primitive_miner")){continue;}
            let creep = Game.creeps[name];
            if(creep.memory.mining)
            {
                // first check if sources are dropped
                let dropped_energy = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES)
                if(creep.pickup(dropped_energy) === ERR_NOT_IN_RANGE)
                {
                    creep.moveTo(dropped_energy);
                }
                else if(creep.harvest(sources[0]) === ERR_NOT_IN_RANGE)
                {
                   creep.moveTo(sources[0]);
                }
                if(creep.carry[RESOURCE_ENERGY] === creep.carryCapacity)
                {
                    creep.memory.mining = false;
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
                else
                {
                    if (creep.upgradeController(creep.room.controller) === ERR_NOT_IN_RANGE)
                    {
                        creep.moveTo(creep.room.controller);
                    }
                }

                if (creep.carry[RESOURCE_ENERGY] === 0)
                {
                    creep.memory.mining = true;
                }
            }
        }





        // only spawn primitive miner creeps in the beginning to speed up the recovery
        let miner_creeps = 0;
        for (let name in Game.creeps)
        {
            if (name.includes('Primitive_miner')) { miner_creeps++;}
            if (name.includes('Miner-')) { miner_creeps++;}
        }

        if(miner_creeps < total_creep_count && Object.keys(Game.creeps).length < 10)
        {
            spawn.spawnCreep([MOVE, WORK, CARRY, CARRY, CARRY],
            spawn.name + '-' + 'Primitive_miner' + '-' + Game.time);
        }



    }
};
