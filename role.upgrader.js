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

                // try{creep.memory.delivering.valueOf()}
                // catch(e){creep.memory.delivering = false;}
/*creep.memory.delivering === false && */
                if(/*creep.memory.delivering === false && */creep.carry[RESOURCE_ENERGY] === 0)
                {
                    if(Object.keys(Game.creeps).length < 3){return;}
                    if(creep.withdraw(spawn.room.storage, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE &&
                        spawn.room.storage.store[RESOURCE_ENERGY] > 1000)
                    {
                        creep.moveTo(spawn.room.storage);
                    }

                    else if((spawn.store[RESOURCE_ENERGY] > 290) &&
                        creep.carry[RESOURCE_ENERGY] === 0 /*&& creep.memory.delivering === false*/)
                    {
                        if(creep.withdraw(spawn, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE)
                        {
                            creep.moveTo(spawn);
                        }
                    }


                    /*if(creep.energy > creep.energyCapacity - 10)
                    {
                        creep.memory.delivering = true;
                    }
                    if(creep.energy < creep.energyCapacity - 10)
                    {
                        creep.memory.delivering = true;
                    }*/
                }
                else
                {
                    if (creep.upgradeController(creep.room.controller) === ERR_NOT_IN_RANGE)
                    {
                        creep.moveTo(creep.room.controller);
                    }

                    /*if(creep.carry[RESOURCE_ENERGY] === 0)
                    {
                        creep.memory.delivering = false;
                    }*/
                }


            }
        }
        catch(e)
        {
            console.log("error in Upgrader");
            console.log(e);
            // creep.memory.delivering = false;
        }


        // Spawning new carrier creep
        let current_creeps = 0;
        for (let name in Game.creeps)
        {
            if (name.includes('Upgrader-')) { current_creeps++;}
        }

        // only spawn upgrader, if there are at least 5 other creeps
        if(current_creeps < total_creep_count && Object.keys(Game.creeps).length > 7)
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
