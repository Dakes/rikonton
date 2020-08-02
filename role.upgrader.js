module.exports =
{
    run(spawn)
    {
        let total_creep_count = 1;

        try
        {
            for(let name in Game.creeps)
            {
                if (!name.includes("Upgrader-")) {continue;}
                let creep = Game.creeps[name];

                if(creep.store[RESOURCE_ENERGY] === 0)
                {
                    if(Object.keys(Game.creeps).length < 3){return;}
                    if(creep.withdraw(spawn.room.storage, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE &&
                        spawn.room.storage.store[RESOURCE_ENERGY] > 1000)
                    {
                        creep.moveTo(spawn.room.storage);
                    }

                    else if((spawn.store[RESOURCE_ENERGY] > 290) &&
                        creep.store[RESOURCE_ENERGY] === 0)
                    {
                        if(creep.withdraw(spawn, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE)
                        {
                            creep.moveTo(spawn);
                        }
                    }
                }
                else
                {
                    if (creep.upgradeController(creep.room.controller) === ERR_NOT_IN_RANGE)
                    {
                        creep.moveTo(creep.room.controller);
                    }
                }


            }
        }
        catch(e)
        {
            console.log("error in Upgrader");
            console.log(e);
            // creep.memory.delivering = false;
        }


        // Spawning new Upgrader creep
        let current_creeps = 0;
        let miner_creeps = 0;
        let miner_carrier_creeps = 0;
        for (let name in Game.creeps)
        {
            if (name.includes('Upgrader-')) { current_creeps++;}
            if (name.includes('Miner-')) { miner_creeps++;}
            if (name.includes('Miner_carrier-')) { miner_carrier_creeps++;}
        }

        // increase total creep count if there is enough energy in storage
        if(spawn.room.storage && spawn.room.storage.store[RESOURCE_ENERGY] > 250000){total_creep_count = 2;}
        if(spawn.room.storage && spawn.room.storage.store[RESOURCE_ENERGY] > 500000){total_creep_count = 3;}

        // get largest dropped energy stack. If more dropped energy, create more upgrader
        let dropped = spawn.room.find(FIND_DROPPED_RESOURCES);
        let dropped_energy = false;
        for (let i in dropped)
        {
            if (dropped[i].resourceType === RESOURCE_ENERGY)
            {
                if(!dropped_energy || dropped[i].amount > dropped_energy.amount)
                {
                    dropped_energy = dropped[i];
                }
            }
        }
        if (dropped_energy.amount > 2000){total_creep_count += 1;}
        if (dropped_energy.amount > 3000){total_creep_count += 1;}
        if (dropped_energy.amount > 4000){total_creep_count += 1;}
        if (dropped_energy.amount > 5000){total_creep_count += 1;}

        // only spawn upgrader, if there are at least 5 other creeps
        if(current_creeps < total_creep_count && ( Object.keys(Game.creeps).length > 7 ||
                                                 (miner_creeps >= 2 && miner_carrier_creeps >= 2) ))
        {
            let parts = [MOVE, CARRY, CARRY, CARRY, WORK, CARRY, WORK, MOVE, CARRY, WORK, CARRY, WORK, MOVE,
                CARRY, WORK, CARRY, WORK, MOVE, CARRY, WORK, CARRY, WORK, MOVE, CARRY, WORK];
            let part_length = Object.keys(parts).length - 1;

            for (let i = 0; i < part_length; i++)
            {
                let success = spawn.spawnCreep(parts, spawn.name + '-' + 'Upgrader' + '-' + Game.time);
                if(success === OK){console.log("Spawning Upgrader: ", parts);return;}
                if(success === ERR_NOT_ENOUGH_ENERGY){parts.pop();}
                if(success === ERR_BUSY){return;}
                if(parts.length < 5){return;}
            }

        }




    }
};
