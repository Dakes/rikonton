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
                if (!name.includes("Carrier")) {continue;}
                let creep = Game.creeps[name];

                if (creep.memory.getting_energy === true)
                {
                    let dropped_energy = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES)
                    if(dropped_energy && creep.pickup(dropped_energy) == ERR_NOT_IN_RANGE && creep.memory.delivering === false)
                    {
                        //console.log("carrier moving to dropped energy");
                        creep.moveTo(dropped_energy);
                    }
                    if(creep.energy < creep.energyCapacity - 10)
                    {
                        creep.memory.getting_energy = false;
                        creep.memory.delivering = true;
                    }
                }

                if(creep.carry[RESOURCE_ENERGY] < (creep.carryCapacity - 10) && creep.memory.getting_energy === true)
                {
                    if(Object.keys(Game.creeps).length < 3){return;}
                    if(creep.withdraw(spawn, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE)
                    {
                        creep.moveTo(spawn);
                    }
                    if(creep.energy > creep.energyCapacity - 10)
                    {
                        creep.memory.getting_energy = false;
                    }
                    if(creep.energy < creep.energyCapacity - 10)
                    {
                        creep.memory.getting_energy = false;
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
                            tower = structures[struct];
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
                                creep.memory.getting_energy = true;
                            }
                            return;
                            break;
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
            if (name.includes('Carrier')) { current_creeps++;}
        }

        // only spawn road constructor, if there are at least 5 other creeps and no road constructor
        if(current_creeps < total_creep_count && Object.keys(Game.creeps).length > 6)
        {
            let name = spawn.name + '-' + 'Carrier' + '-' + Game.time;
            spawn.spawnCreep([CARRY, CARRY, CARRY, CARRY, MOVE], name);
            new_carrier = spawn.room.find(FIND_CREEPS, {filter: function(object) {return object.name.includes(name)}});
            if(new_carrier)
            {
                new_carrier.memory.delivering = false;
                new_carrier.memory.getting_energy = true;
            }
        }




    }
};
