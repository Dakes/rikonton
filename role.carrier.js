/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('role.carrier');
 * mod.thing == 'a thing'; // true
 */

module.exports =
{
    run(spawn)
    {
        let total_creep_count = 1;

        // TODO: only build if total creep count > 5

        try
        {
            // loop through creeps

            for(let name in Game.creeps)
            {
                if (!name.includes("Carrier-")) {continue;}
                let creep = Game.creeps[name];

                try{creep.memory.delivering;}
                catch{creep.memory.delivering = false;}

                /*
                if (creep.memory.delivering === false)
                {
                    let dropped_energy = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES)
                    if(dropped_energy && creep.pickup(dropped_energy) === ERR_NOT_IN_RANGE && creep.memory.delivering === false)
                    {
                        //console.log("carrier moving to dropped energy");
                        creep.moveTo(dropped_energy);
                    }
                    if(creep.energy < creep.energyCapacity - 10)
                    {
                        creep.memory.delivering = true;
                    }
                }
                 */

                if(creep.carry[RESOURCE_ENERGY] < (creep.carryCapacity - 10) && creep.memory.delivering === false)
                {
                    if(Object.keys(Game.creeps).length < 3){return;}
                    if(creep.withdraw(spawn.room.storage, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE)
                    {
                        creep.moveTo(spawn.room.storage);
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
                    for (let struct in structures)
                    {
                        // DELIVERING TO TOWER
                        if(structures[struct].structureType === "tower")
                        {
                            let tower = structures[struct];
                            if(tower.energy === tower.energyCapacity){continue;}
                            creep.memory.delivering = true;
                            // let test = creep.transfer(towers[tower], RESOURCE_ENERGY);
                            // console.log(test);
                            if(creep.transfer(tower, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE)
                            {
                                creep.moveTo(tower);
                            }
                            if(creep.carry[RESOURCE_ENERGY] === 0)
                            {
                                creep.memory.delivering = false;
                            }
                            return;
                        }

                        // DELIVERING TO EXTENSION
                        if(structures[struct].structureType === STRUCTURE_EXTENSION)
                        {
                            let extension = structures[struct];
                            if(extension.energy === extension.energyCapacity){continue;}
                            creep.memory.delivering = true;
                            if(creep.transfer(extension, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE)
                            {
                                creep.moveTo(extension);
                            }
                            if(creep.carry[RESOURCE_ENERGY] === 0)
                            {
                                creep.memory.delivering = false;
                            }
                            return;
                        }

                        //DELIVERING TO SPAWN
                        if(spawn.energy < spawn.energyCapacity)
                        {
                            creep.memory.delivering = true;
                            if(creep.transfer(spawn, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE)
                            {
                                creep.moveTo(spawn);
                                creep.memory.delivering = false;
                            }
                            if(creep.carry[RESOURCE_ENERGY] === 0)
                            {
                                creep.memory.delivering = false;
                            }
                            return;
                        }



                    }
                }

            }
        }
        catch(e)
        {
            console.log("error in carrier");
            console.log(e);
            creep.memory.delivering = false;
        }


        // Spawning new carrier creep
        let current_creeps = 0;
        for (let name in Game.creeps)
        {
            if (name.includes('Carrier-')) { current_creeps++;}
        }

        // only spawn road constructor, if there are at least 5 other creeps and no road constructor
        if(current_creeps < total_creep_count && Object.keys(Game.creeps).length > 6)
        {
            let name = spawn.name + '-' + 'Carrier' + '-' + Game.time;
            spawn.spawnCreep([CARRY, CARRY, CARRY, CARRY, MOVE], name);
        }




    }
};
