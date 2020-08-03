/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('road');
 * mod.thing == 'a thing'; // true
 */

module.exports = {
    run(spawn)
    {

        // Memory.road_array = [];
        // Memory.source_set = false;
        // Memory.room_controller_set = false;

        // Memory.road_build_counter = 99999
        /*// delete road construction sites
        Memory.road_calculate_counter = 99999999
        let construction_sites = spawn.room.find(FIND_CONSTRUCTION_SITES);
        for (let site of construction_sites)
        {
            if (site.structureType === STRUCTURE_ROAD){ site.remove(); }
        }*/


        // Memory.road_build_counter = 99999;Memory.road_calculate_counter = 99999;spawn.room.memory.tower_set = false;

        let total_creep_count = 1;

        // loop through creeps
        for(let name in Game.creeps)
        {
            if (!name.includes("Road_constructor")) {continue;}
            let creep = Game.creeps[name];

            if(Object.keys(Game.creeps).length < 5)
            {
                // TODO: automate idle position
                creep.moveTo(creep.room.getPositionAt(33, 33));
                continue;
            }

            // road_array : [[spawn_name, structureType, path], ...]
            try
            {
                // check if roads were already set


                // loop through saved road_array and check saved roads
                if(!Memory.road_set && !Memory.room_controller_set)
                {
                    for(let i = 0; i < Memory.road_array.length; i++)
                    {
                        if(Memory.road_array[i].contains("source")){Memory.source_set = true;}
                        if(Memory.road_array[i].contains("room_controller")){Memory.room_controller_set = true;}
                    }
                }

                // every 10000 ticks recalculate roads, (works)
                Memory.road_calculate_counter++;
                if(Memory.road_calculate_counter > 10000)
                {
                    console.log("recalculating roads");
                    Memory.road_array = [];
                    Memory.source_set = false;
                    Memory.room_controller_set = false;
                    Memory.road_calculate_counter = 0;

                    // delete old construction sites
                    let construction_sites = spawn.room.find(FIND_CONSTRUCTION_SITES);
                    for (let site of construction_sites)
                    {
                        if (site.structureType === STRUCTURE_ROAD){ site.remove(); }
                    }
                }

                // source streets
                if (!Memory.source_set)
                {
                    let sources = spawn.room.find(FIND_SOURCES);
                    for (let j = 0; j < sources.length; j++)
                    {
                        let path = spawn.pos.findPathTo(sources[j].pos);
                        Memory.road_array.push([spawn.name, "source", path]);
                        Memory.source_set = true;
                    }
                }
                // Room Controller streets
                if (!Memory.room_controller_set)
                {
                    let rc = spawn.room.controller;

                    let path = spawn.pos.findPathTo(rc);
                    Memory.road_array.push([spawn.name, "room_controller", path]);
                    Memory.room_controller_set = true;
                }
                // tower streets
                //Memory.road_build_counter = 99999;Memory.road_calculate_counter = 99999;spawn.room.memory.tower_set = false;

                if (!spawn.room.memory.tower_set)
                {
                    let structures = spawn.room.find(FIND_MY_STRUCTURES);
                    // for every tower
                    for(let struct in structures)
                    {
                        if(structures[struct].structureType === "tower")
                        {
                            let tower = structures[struct];
                            let min_path = tower.pos.findPathTo(spawn.pos);

                            // now loop through every road, calculate the path and save the min
                            let road_structures = spawn.room.find(FIND_STRUCTURES);
                            for(let road_struct in road_structures)
                            {
                                console.log(road_structures[road_struct].structureType);
                                if (road_structures[road_struct].structureType === "road")
                                {
                                    let road = road_structures[road_struct];
                                    let current = tower.pos.findPathTo(road.pos);
                                    console.log(current.lenghth);
                                    if(current.length < min_path.length && current.length !== 0)
                                    {
                                        min_path = current;
                                        console.log("setting min path");
                                    }
                                }
                            }

                            // let path = tower.pos.findPathTo(FIND_MY_STRUCTURES, {filter: function(object) {return object.structureType === "road"}});
                            // let path = tower.pos.findPathTo(spawn.pos);  // working
                            // console.log(path);
                            Memory.road_array.push([spawn.name, "tower" + struct, min_path]);

                        }
                    }
                    spawn.room.memory.tower_set = true;
                }

                // TODO: add other structures



                // Build the roads
                Memory.road_build_counter++;
                if(Memory.road_build_counter > 1000)
                {
                    console.log("rebuilding roads");
                    for (let i = 0; i < Memory.road_array.length; i++)
                    {
                        for (let j = 0; j < Memory.road_array[i][2].length-1; j++)
                        {
                            //console.log("creating construction site");
                            spawn.room.createConstructionSite
                            (Memory.road_array[i][2][j].x,Memory.road_array[i][2][j].y, STRUCTURE_ROAD);
                        }
                    }
                    Memory.road_build_counter = 0;
                    // delete accidentally built tunnels
                    let construction_sites = spawn.room.find(FIND_CONSTRUCTION_SITES);
                    for (let site of construction_sites)
                    {
                        if (site.structureType === STRUCTURE_ROAD && site.progressTotal > 1501)
                        {
                            site.remove();
                        }
                    }
                }
            }
            catch(e)
            {
                Memory.road_array = [];
                Memory.source_set = false;
                Memory.room_controller_set = false;
                spawn.room.memory.tower_set = false;
                Memory.road_build_counter = 0;
                Memory.road_calculate_counter = 0;
            }




            // Creep Code ----------------------------------------------------------------------------------------------

            // before building, check if creep has energy

            try{creep.memory.building.valueOf()}
            catch(e){creep.memory.building = false;}
            try{creep.memory.road_repair_prev.valueOf()}
            catch(e){creep.memory.road_repair_prev = false;}

            // check if creep is empty and creep.memory.building is true (bug) and set to false
            if (creep.memory.building === true && creep.carry[RESOURCE_ENERGY] === 0)
            {
                creep.memory.building = false;
            }

            // get energy from storage
            if(spawn.room.storage && creep.carry[RESOURCE_ENERGY] < (creep.carryCapacity - 10) &&
                creep.memory.building === false)
            {
                if(creep.withdraw(spawn.room.storage, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE)
                {
                    creep.moveTo(spawn.room.storage);
                }
            }
            // get energy from spawn
            else if((spawn.store[RESOURCE_ENERGY] > 290) &&
                creep.carry[RESOURCE_ENERGY] < (creep.carryCapacity - 10) && creep.memory.building === false)
            {

                if(creep.withdraw(spawn, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE)
                {
                    creep.moveTo(spawn);
                }
            }
            else
            {
                let road_to_repair = creep.pos.findClosestByRange(
                    FIND_STRUCTURES, {
                        filter: function(object){return object.structureType === STRUCTURE_ROAD && (object.hits < object.hitsMax / 2);}
                    });


                if(creep.memory.road_repair_prev !== false)
                {
                    creep.memory.building = true;

                    let x = creep.memory.road_repair_prev.pos.x;
                    let y = creep.memory.road_repair_prev.pos.y;
                    let current_road = spawn.room.lookForAt(LOOK_STRUCTURES, x, y)[0];

                    if(creep.repair(current_road) === ERR_NOT_IN_RANGE)
                    {
                        creep.moveTo(current_road);
                    }
                    if(current_road.hits > current_road.hitsMax - 100)
                    {
                        creep.memory.road_repair_prev = false;
                        creep.memory.building = false;
                    }
                    continue;
                }


                if(road_to_repair !== null && creep.repair(road_to_repair) === ERR_NOT_IN_RANGE)
                {
                    creep.memory.building = true;
                    creep.moveTo(road_to_repair);

                    continue;
                }
                else if(road_to_repair !== null && road_to_repair.hits < road_to_repair.hitsMax - 10)
                {
                    creep.memory.road_repair_prev = road_to_repair;
                }

                if(creep.carry[RESOURCE_ENERGY] === 0){creep.memory.building = false;}


                // BUILD THE CONSTRUCTION SITES

                let constSites = spawn.room.find(FIND_CONSTRUCTION_SITES);

                for (let siteName in constSites)
                {
                    if(constSites[siteName].structureType === STRUCTURE_ROAD)
                    {
                        creep.memory.building = true;
                        if(creep.build(constSites[siteName]) === ERR_NOT_IN_RANGE)
                        {
                            creep.moveTo(constSites[siteName]);
                        }
                        if(creep.carry[RESOURCE_ENERGY] === 0)
                        {
                            creep.memory.building = false;
                        }
                        break;
                    }
                }

                if(creep.carry[RESOURCE_ENERGY] === 0)
                {
                    creep.memory.building = false;
                    creep.memory.roadToRepair = false;
                }
                // nothing to repair, move to idle position
                if(true === false)
                {
                    // TODO: automate idle position
                    creep.moveTo(creep.room.getPositionAt(33, 33));
                }

            }
            //Game.creeps[name].ConstructionSite.
        }


        // Generate new road_constructor creep
        let builder_creeps = 0;
        for (let name in Game.creeps)
        {
            if (name.includes('Road_constructor')) { builder_creeps++;}
        }

        // only spawn road constructor, if there are at least 5 other creeps and no road constructor
        if(builder_creeps < total_creep_count && Object.keys(Game.creeps).length > 5)
        {
            let parts = [CARRY, CARRY, CARRY, WORK, MOVE, CARRY, WORK, MOVE, CARRY, WORK, MOVE, CARRY, WORK,
                CARRY, WORK, MOVE, CARRY, WORK, CARRY, WORK, MOVE, CARRY, WORK, CARRY, WORK, MOVE];
            let part_length = Object.keys(parts).length - 1;

            for (let i = 0; i < part_length; i++)
            {
                let success = spawn.spawnCreep(parts, spawn.name + '-' + 'Road_constructor' + '-' + Game.time);
                if(success === OK){console.log("Spawning Road_constructor: ", parts);return;}
                if(success === ERR_NOT_ENOUGH_ENERGY){parts.pop();}
                if(success === ERR_BUSY){return;}
                if(parts.length < 5){return;}
            }

        }

    }

};
