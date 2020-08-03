module.exports =
{
    run(spawn)
    {
        try
        {
            // loop through creeps
            for (let name in Game.creeps)
            {
                if (!name.includes("Extension-carrier-"))
                {
                    continue;
                }
                let creep = Game.creeps[name];

                if (typeof creep.memory.delivering === "undefined")
                {
                    creep.memory.delivering = false;
                }

                if (!creep.memory.delivering && creep.store.getUsedCapacity(RESOURCE_ENERGY) < (creep.store.getCapacity() - 10))
                {
                    if (Object.keys(Game.creeps).length < 3)
                    {
                        return;
                    }

                    // withdraw from storage
                    if (spawn.room.storage && spawn.room.storage.store.getUsedCapacity(RESOURCE_ENERGY) > 10000 &&
                        creep.withdraw(spawn.room.storage, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE)
                    {
                        creep.moveTo(spawn.room.storage);
                    }
                    // withdraw from spawn
                    else if (spawn.store[RESOURCE_ENERGY] > 290)
                    {
                        if (creep.withdraw(spawn, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE)
                        {
                            creep.moveTo(spawn);
                        }
                    }

                    if (creep.energy > creep.energyCapacity - 10)
                    {
                        creep.memory.delivering = true;
                    }
                    if (creep.energy < creep.energyCapacity - 10)
                    {
                        creep.memory.delivering = false;
                    }
                } else
                {
                    let structures = spawn.room.find(FIND_MY_STRUCTURES);
                    for (let struct in structures)
                    {
                        // DELIVERING TO EXTENSION
                        if (structures[struct].structureType === STRUCTURE_EXTENSION)
                        {
                            let extension = structures[struct];
                            if (extension.store.getUsedCapacity(RESOURCE_ENERGY) >= extension.store.getCapacity(RESOURCE_ENERGY))
                            {
                                continue;
                            }
                            creep.memory.delivering = true;

                            if (creep.transfer(extension, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE)
                            {
                                creep.moveTo(extension);
                            }
                            // extension not excessable, f.e. room controller downgrade
                            else if (creep.transfer(extension, RESOURCE_ENERGY) === ERR_FULL)
                            {}
                            if (creep.store.getUsedCapacity(RESOURCE_ENERGY) === 0)
                            {
                                creep.memory.delivering = false;
                            }
                            break;
                        }
                    }
                }


            }
        } catch (e)
        {
            console.log("error in carrier");
            console.log(e);
            creep.memory.delivering = false;
        }


        // Spawning new carrier creep
        let total_creep_count = 0;
        let current_creeps = 0;
        for (let name in Game.creeps)
        {
            if (name.includes('Extension-carrier-'))
            {
                current_creeps++;
            }
        }

        let rc_level = spawn.room.controller.level;
        if (rc_level >= 3){total_creep_count += 1;}
        if (rc_level >= 5){total_creep_count += 1;}
        if (rc_level >= 8){total_creep_count += 1;}

        if (current_creeps < total_creep_count)
        {
            let parts = [MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, CARRY, MOVE, CARRY, MOVE, CARRY,
                CARRY, MOVE, CARRY, CARRY, MOVE, CARRY, CARRY, MOVE, CARRY, CARRY, MOVE, CARRY, CARRY];
            let part_length = Object.keys(parts).length - 1;

            for (let i = 0; i < part_length; i++)
            {
                let success = spawn.spawnCreep(parts, spawn.name + '-' + 'Extension-carrier' + '-' + Game.time);
                if (success === OK)
                {
                    console.log("Spawning Extension-carrier: ", parts);
                    return;
                }
                if (success === ERR_NOT_ENOUGH_ENERGY)
                {
                    parts.pop();
                }
                if (success === ERR_BUSY)
                {
                    return;
                }
                if (parts.length < 10)
                {
                    return;
                }
            }
        }
    }
}