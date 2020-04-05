/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('room');
 * mod.thing == 'a thing'; // true
 console.log();
 */

module.exports =
{
    run(spawn)
    {
        let sources = spawn.room.find(FIND_SOURCES);
        let total_creep_count = Object.keys(sources).length * 1;

        for(let name in Game.creeps)
        {
            if (!name.includes("Miner_carrier")){continue;}
            let creep = Game.creeps[name];

            try{creep.memory.collecting.valueOf();}
            catch(e){creep.memory.collecting = true;}

            // set source in memory
            try{creep.memory.source_id.valueOf();}
            catch(e){creep.memory.source_id = false;}

            let sources = spawn.room.find(FIND_SOURCES);
            if(creep.memory.source_id === false)
            {
                for (let i in sources)
                {
                    let source = sources[i];
                    // iterate through miners, next if miner has source id
                    let occupied = false;
                    for (let name2 in Game.creeps)
                    {
                        if (!name2.includes("Miner_carrier")){continue;}
                        if(Game.creeps[name2].memory.source_id === source.id){occupied = true;}
                    }
                    if(occupied === false)
                    {
                        creep.memory.source_id = source.id;
                        break;
                    }
                }
            }

            if(creep.memory.collecting)
            {
                // first check, if container is full enough
                for(let i in spawn.room.memory.container_pos)
                {
                    let container_source = spawn.room.memory.container_pos[i];
                    if(container_source[1] === creep.memory.source_id)
                    {
                        // identify container with the position
                        let containers = spawn.room.find(
                        FIND_MY_STRUCTURES, {filter: {structureType: STRUCTURE_CONTAINER}});
                        // console.log(containers);
                        for(let j in containers)
                        {
                            let container = containers[j];
                            console.log(container.pos.x);
                            if (container.pos.x === container_source[0].x && container.pos.y === container_source[0].y)
                            {
                                console.log("here");
                                if(container.store[RESOURCE_ENERGY] > creep.store.getCapacity(RESOURCE_ENERGY) ||
                                container.store[RESOURCE_ENERGY] === container.store.getCapacity(RESOURCE_ENERGY))
                                {
                                    if(creep.withdraw(container, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE)
                                    {
                                       creep.moveTo(container);
                                    }
                                    else if(creep.store[RESOURCE_ENERGY] === creep.store.getCapacity(RESOURCE_ENERGY))
                                    {
                                        creep.memory.collecting = false;
                                    }

                                }
                            }
                        }

                    }
                }

                // console.log("picking up dropped");
                //else pick up any dropped energy
                // get largest dropped stack
                let dropped_energy = false;
                let dropped = spawn.room.find(FIND_DROPPED_RESOURCES);

                // prevent deadlocks
                if (!dropped){creep.memory.collecting = false;}

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

                if(creep.pickup(dropped_energy) === ERR_NOT_IN_RANGE)
                {
                    creep.moveTo(dropped_energy);
                }
                if(creep.carry[RESOURCE_ENERGY] === creep.carryCapacity)
                {
                    creep.memory.collecting = false;
                }
            }
            // deliver energy
            else
            {

                if(spawn.store[RESOURCE_ENERGY] < spawn.store.getCapacity(RESOURCE_ENERGY))
                {
                    if(creep.transfer(spawn, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE)
                    {
                       creep.moveTo(spawn);
                    }
                }
                else if(spawn.room.storage && spawn.room.storage.store.getFreeCapacity() > 500)
                {
                    if(creep.transfer(spawn.room.storage, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE)
                    {
                       creep.moveTo(spawn.room.storage);
                    }
                }

                if (creep.carry[RESOURCE_ENERGY] === 0)
                {
                    creep.memory.collecting = true;
                }
            }
        }



        let current_creeps = 0;
        for (let name in Game.creeps)
        {
            if (name.includes('Miner_carrier')) { current_creeps++;}
        }
        if(Object.keys(Game.creeps).toString().includes("Miner-") && current_creeps < total_creep_count)
        {
            let parts = [MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, CARRY, CARRY, MOVE, CARRY,
                CARRY, MOVE, CARRY, CARRY, MOVE, CARRY, CARRY, MOVE, CARRY, CARRY, MOVE, CARRY, CARRY];
            let part_length = Object.keys(parts).length - 1;

            for (let i = 0; i < part_length; i++)
            {
                let success = spawn.spawnCreep(parts, spawn.name + '-' + 'Miner_carrier' + '-' + Game.time);
                if(success === OK){console.log("Spawning Miner Carrier: ", parts);return;}
                if(success === ERR_NOT_ENOUGH_ENERGY){parts.pop();}
                if(success === ERR_BUSY){return;}
                if(parts.length < 6){return;}
            }

        }

    }

};
