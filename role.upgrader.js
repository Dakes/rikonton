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

                try{creep.memory.delivering.valueOf()}
                catch(e){creep.memory.delivering = false;}

                if(creep.memory.delivering === false && creep.carry[RESOURCE_ENERGY] < (creep.carryCapacity - 10))
                {
                    if(Object.keys(Game.creeps).length < 3){return;}
                    if(creep.withdraw(spawn.room.storage, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE &&
                        spawn.room.storage.store[RESOURCE_ENERGY] > 1000)
                    {
                        creep.moveTo(spawn.room.storage);
                    }

                    else if((spawn.store[RESOURCE_ENERGY] > 290) &&
                        creep.carry[RESOURCE_ENERGY] < (creep.carryCapacity - 10) && creep.memory.delivering === false)
                    {
                        if(creep.withdraw(spawn, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE)
                        {
                            creep.moveTo(spawn);
                        }
                    }


                    if(creep.energy > creep.energyCapacity - 10)
                    {
                        creep.memory.delivering = true;
                    }
                    if(creep.energy < creep.energyCapacity - 10)
                    {
                        creep.memory.delivering = true;
                    }
                }
                else
                {
                    let structures = spawn.room.find(FIND_MY_STRUCTURES);

                    if (creep.upgradeController(creep.room.controller) === ERR_NOT_IN_RANGE)
                    {
                        creep.moveTo(creep.room.controller);
                    }

                    if(creep.carry[RESOURCE_ENERGY] === 0)
                    {
                        creep.memory.delivering = false;
                    }
                }


            }
        }
        catch(e)
        {
            console.log("error in Upgrader");
            console.log(e);
            creep.memory.delivering = false;
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
            let name = spawn.name + '-' + 'Upgrader' + '-' + Game.time;
            spawn.spawnCreep([CARRY, CARRY, CARRY, WORK, MOVE], name);
        }




    }
};
