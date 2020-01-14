module.exports =
{
    run(spawn)
    {
        let total_creep_count = 10;

        let sources = spawn.room.find(FIND_SOURCES);


        for(let name in Game.creeps)
        {
            if (!name.includes("Primitive_miner")){continue;}
            let creep = Game.creeps[name];

            try{creep.memory.source.valueOf();}
            catch(e)
            {
                let time = Game.time;
                if (time % 2 === 0){ creep.memory.source = 0; }
                else{ creep.memory.source = 1; }
            }

            if(creep.memory.mining)
            {
                let dropped = spawn.room.find(FIND_DROPPED_RESOURCES);

                // first check if energy is dropped
                let dropped_energy = [];
                for (let i in dropped)
                {
                    if (dropped[i].resourceType === "energy")
                    {
                        dropped_energy.push(dropped[i]);
                    }
                }

                // pickup dropped minerals
                let dropped_resources = [];
                for (let i in dropped)
                {
                    if (dropped[i].resourceType !== "energy")
                    {
                        dropped_resources.push(dropped[i]);
                    }
                }

                if(dropped_resources[0] && creep.pickup(dropped_resources[0]) === ERR_NOT_IN_RANGE)
                {
                    creep.moveTo(dropped_resources[0]);
                }
                if(creep.carry === creep.carryCapacity)
                {
                    creep.memory.mining = false;
                }

                if(dropped_energy[0] && creep.pickup(dropped_energy[0]) === ERR_NOT_IN_RANGE)
                {
                    creep.moveTo(dropped_energy[0]);
                }

                else if(sources.length >= 2)
                {
                    if(creep.harvest(sources[creep.memory.source]) === ERR_NOT_IN_RANGE)
                    {
                       creep.moveTo(sources[creep.memory.source]);
                    }
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
                // check if creep is carrying minerals
                if(creep.carry !== RESOURCE_ENERGY)
                {
                    if(creep.transfer(spawn.room.storage, creep.carry) === ERR_NOT_IN_RANGE)
                    {
                       creep.moveTo(spawn.room.storage);
                    }
                }

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

        if(miner_creeps < total_creep_count && Object.keys(Game.creeps).length < 13)
        {
            spawn.spawnCreep([MOVE, WORK, CARRY, CARRY, CARRY],
            spawn.name + '-' + 'Primitive_miner' + '-' + Game.time);
        }



    }
};
