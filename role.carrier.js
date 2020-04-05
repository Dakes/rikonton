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
        if(Object.keys(Game.creeps).length > 12){total_creep_count = 2}

        // TODO: only build if total creep count > 5

        try
        {
            // loop through creeps

            for(let name in Game.creeps)
            {
                if (!name.includes("Carrier-")) {continue;}
                let creep = Game.creeps[name];

                if(typeof creep.memory.delivering === "undefined"){creep.memory.delivering = false;}

                if(creep.memory.delivering === false && creep.carry[RESOURCE_ENERGY] < (creep.carryCapacity - 10))
                {
                    if(Object.keys(Game.creeps).length < 3){return;}

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

                    // withdraw from storage
                    else if(spawn.room.storage && creep.withdraw(spawn.room.storage, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE)
                    {
                        creep.moveTo(spawn.room.storage);
                    }
                    // withdraw from spawn
                    else if(spawn.store[RESOURCE_ENERGY] > 290)
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

        if(current_creeps < total_creep_count && Object.keys(Game.creeps).length > 6)
        {
            let parts = [MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, CARRY, MOVE, CARRY, MOVE, CARRY,
                CARRY, MOVE, CARRY, CARRY, MOVE, CARRY, CARRY, MOVE, CARRY, CARRY, MOVE, CARRY, CARRY];
            let part_length = Object.keys(parts).length - 1;

            for (let i = 0; i < part_length; i++)
            {
                let success = spawn.spawnCreep(parts, spawn.name + '-' + 'Carrier' + '-' + Game.time);
                if(success === OK){console.log("Spawning Carrier: ", parts);return;}
                if(success === ERR_NOT_ENOUGH_ENERGY){parts.pop();}
                if(success === ERR_BUSY){return;}
                if(parts.length < 6){return;}
            }
        }




    }
};
