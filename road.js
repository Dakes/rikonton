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
        /*
        Memory.road_array = [];
        Memory.source_set = false;
        Memory.room_controller_set = false;

        */
        spawn.room.memory.tower_set = false;

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
                return;
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
                    Memory.road_array = [];
                    Memory.source_set = false;
                    Memory.room_controller_set = false;
                    Memory.road_calculate_counter = 0;
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
                if (!spawn.room.memory.tower_set)
                {
                    let structures = spawn.room.find(FIND_MY_STRUCTURES);
                    // for every tower
                    for(let struct in structures)
                    {
                        tower = structures[struct];
                        if(tower.structureType === "tower")
                        {
                            console.log("in here2");
                            let path = tower.pos.findPathTo(FIND_MY_STRUCTURES, {filter: function(object) {return object.structureType === "road"}});
                            console.log(path);
                            // Memory.road_array.push([spawn.name, "tower" + struct, path]);
                            console.log("test");

                        }
                    }
                    spawn.room.memory.tower_set = true;
                }

                // TODO: add other structures



                // Build the roads
                Memory.road_build_counter++;
                if(Memory.road_build_counter > 1000)
                {
                    for (let i = 0; i < Memory.road_array.length; i++)
                    {
                        for (let j = 0; j < Memory.road_array[i][2].length-1; j++)
                        {
                            //console.log("creating construction site");
                            spawn.room.createConstructionSite
                            (Memory.road_array[i][2][j].x,Memory.road_array[i][2][j].y, STRUCTURE_ROAD);
                            Memory.road_build_counter = 0;
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




            // Creep Code ------------------------------------------------------

            let constSites = spawn.room.find(FIND_CONSTRUCTION_SITES);

            // before building, check if creep has energy

            if(creep.carry[RESOURCE_ENERGY] < (creep.carryCapacity - 10) && creep.memory.building === false)
            {
                if(spawn.transferEnergy(creep) === ERR_NOT_IN_RANGE)
                {
                    creep.moveTo(spawn);
                }
            }
            else
            {
                for (let siteName in constSites)
                {
                    if(constSites[siteName].structureType === "road")
                    {
                        creep.memory.building = true;
                        if(creep.build(constSites[siteName]) === ERR_NOT_IN_RANGE)
                        {
                            Game.creeps[name].moveTo(constSites[siteName]);
                        }
                        if(creep.carry[RESOURCE_ENERGY] === 0)
                        {
                            creep.memory.building = false;
                        }
                        return;
                        break;
                    }

                }

                // road repair

                let roadToRepair = creep.pos.findClosestByRange(
                    FIND_STRUCTURES, {
                        filter: function(object){return object.structureType === STRUCTURE_ROAD && (object.hits < object.hitsMax / 2);
                    }
                });

                if(roadToRepair)
                {
                    if(creep.repair(roadToRepair) === ERR_NOT_IN_RANGE)
                    {
                        creep.moveTo(roadToRepair);
                        break;
                    }


                }
                // nothing to repair, move to idle position
                else
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
            spawn.spawnCreep([CARRY, CARRY, CARRY, WORK, MOVE],
            spawn.name + '-' + 'Road_constructor' + '-' + Game.time);
        }


    }

    //function build_road_to_structure(let structure)
    //{

    //}

};
