module.exports =
{
    run(spawn)
    {
        let total_creep_count = 6;

        let sources = spawn.room.find(FIND_SOURCES);
        if(sources.length === 1){total_creep_count = 3}

        let containers = spawn.room.find(FIND_STRUCTURES, {filter: (i) => {return( i.structureType == STRUCTURE_CONTAINER)}});
        if (containers.length >= 2){total_creep_count -= 3}

        for(let name in Game.creeps)
        {
            if (name.includes("Miner_carrier")){total_creep_count -= 1;}
            if (name.includes("Miner-")){total_creep_count -= 1;}
            if (!name.includes("Primitive_miner")){continue;}
            let creep = Game.creeps[name];

            try{creep.memory.source.valueOf();}
            catch(e)
            {
                let time = Game.time;
                if (time % 2 === 0){ creep.memory.source = 0; }
                else{ creep.memory.source = 1; }
            }
            if(creep.memory.dropped_energy && Game.getObjectById(creep.memory.dropped_energy.id) == null)
            {
                creep.memory.dropped_energy = false;
            }

            if(creep.memory.mining)
            {
                // pickup from ruins
                let ruins = spawn.room.find(FIND_RUINS);
                let ruin = false;
                for (let i in ruins)
                {
                    if (ruins[i] && ruins[i].store.getUsedCapacity([RESOURCE_ENERGY]) > 0)
                    {
                        ruin = ruins[i];
                        break;
                    }
                }
                if(ruin)
                {
                    if(creep.withdraw(ruin, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE)
                    {
                        creep.moveTo(ruin);
                    }
                }

                // pickup from Tombstones
                let tombstones = spawn.room.find(FIND_RUINS);
                let tombstone = false;
                for (let i in tombstones)
                {
                    if (tombstone[i] && tombstone[i].store.getUsedCapacity([FIND_TOMBSTONES]) > 0)
                    {
                        tombstone = tombstones[i];
                        break;
                    }
                }
                if(tombstone)
                {
                    if(creep.withdraw(tombstone, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE)
                    {
                        creep.moveTo(tombstone);
                    }
                }

                let dropped = spawn.room.find(FIND_DROPPED_RESOURCES);

                // get largest dropped energy stack
                let dropped_energy = false;
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

                // get dropped minerals
                let dropped_resources = [];
                for (let i in dropped)
                {
                    if (dropped[i].resourceType !== "energy")
                    {
                        dropped_resources.push(dropped[i]);
                    }
                }

                // pickup dropped minerals
                if(dropped_resources[0] && creep.pickup(dropped_resources[0]) === ERR_NOT_IN_RANGE)
                {
                    creep.moveTo(dropped_resources[0]);
                }
                // pickup dropped energy

                if(dropped_energy && dropped_energy.amount > creep.carryCapacity && creep.memory.dropped_energy === false)
                {
                    creep.memory.dropped_energy = dropped_energy
                }
                if(creep.memory.dropped_energy && Game.getObjectById(creep.memory.dropped_energy.id) &&
                    Game.getObjectById(creep.memory.dropped_energy.id).amount > creep.carryCapacity &&
                    creep.pickup(Game.getObjectById(creep.memory.dropped_energy.id)) === ERR_NOT_IN_RANGE)
                {
                    creep.moveTo(Game.getObjectById(creep.memory.dropped_energy.id));
                }

                if(creep.carry === creep.carryCapacity)
                {
                    creep.memory.mining = false;
                }
                if(creep.memory.dropped_energy && creep.memory.dropped_energy.amount < 20)
                {
                    creep.memory.dropped_energy = false;
                }
                else if(sources.length >= 2 && dropped_energy.amount < creep.carryCapacity)
                {
                    if(creep.harvest(sources[creep.memory.source]) === ERR_NOT_IN_RANGE)
                    {
                       creep.moveTo(sources[creep.memory.source]);
                    }
                }

                else if(creep.harvest(sources[creep.memory.source]) === ERR_NOT_IN_RANGE)
                {
                   creep.moveTo(sources[creep.memory.source]);
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

                // unload to spawn
                if(spawn.energy < spawn.energyCapacity - 5)
                {
                    if(creep.transfer(spawn, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE)
                    {
                       creep.moveTo(spawn);
                    }
                }
                // unload to storage, if exists
                else if(spawn.room.storage && spawn.room.storage.store.getFreeCapacity() > 500)
                {
                    if(creep.transfer(spawn.room.storage, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE)
                    {
                       creep.moveTo(spawn.room.storage);
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
            // if (name.includes('Miner-')) { miner_creeps++;}
        }

        if(miner_creeps < total_creep_count && Object.keys(Game.creeps).length < 15)
        {
            spawn.spawnCreep([MOVE, WORK, CARRY, CARRY, CARRY],
            spawn.name + '-' + 'Primitive_miner' + '-' + Game.time, {
                memory: {dropped_energy: false, mining: true}
            });
        }



    }
};
