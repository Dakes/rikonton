/*
 * Code for other Structures like containers
 */

function positions_around(pos)
{
    let result_pos = [];

    result_pos.push(new RoomPosition(pos.x - 1, pos.y + 1, pos.roomName));
    result_pos.push(new RoomPosition(pos.x + 0, pos.y + 1, pos.roomName));
    result_pos.push(new RoomPosition(pos.x + 1, pos.y + 1, pos.roomName));
    result_pos.push(new RoomPosition(pos.x + 1, pos.y + 0, pos.roomName));
    result_pos.push(new RoomPosition(pos.x + 1, pos.y - 1, pos.roomName));
    result_pos.push(new RoomPosition(pos.x + 0, pos.y - 1, pos.roomName));
    result_pos.push(new RoomPosition(pos.x - 1, pos.y - 1, pos.roomName));
    result_pos.push(new RoomPosition(pos.x - 1, pos.y + 0, pos.roomName));

    return result_pos;
};

module.exports =
{


    run(spawn)
    {
        // Storage
        try{spawn.room.memory.storage_counter++;}      // boolean
        catch(e){spawn.room.memory.storage_counter = 0;}

        if(!spawn.room.StructureStorage && spawn.room.memory.storage_counter > 1000)
        {
            console.log("trying to build storage");
            // build storage one left of spawn
            let x_coord = spawn.pos.x - 1;
            let y_coord = spawn.pos.y;

            // TODO: delete street at this position

            spawn.room.createConstructionSite(x_coord, y_coord, STRUCTURE_STORAGE);

            spawn.room.memory.storage_counter = 0;
        }

        // Container (at Sources)
        // set container position in room memory, with source id [[pos, source_id], ...]
        try{spawn.room.memory.container_pos.valueOf();}
        catch(e)
        {
            spawn.room.memory.container_pos = false;
        }

        if(!spawn.room.memory.container_pos)
        {
            spawn.room.memory.container_pos = [];
            console.log("setting container positions");
            let room_terrain = Game.map.getRoomTerrain(spawn.room.name)
            let sources = spawn.room.find(FIND_SOURCES);
            for (let i in sources)
            {
                let source = sources[i];
                source_positions_around = positions_around(source.pos);
                //check for plain or swamp
                for(let i in source_positions_around)
                {
                    let source_pos = source_positions_around[i];
                    // 0 = plain, 1 = wall, 2 = swamp
                    let terrain = room_terrain.get(source_pos.x, source_pos.y);
                    // break if plain or swamp was found and use as position for container
                    if(terrain === 0 || terrain === 2)
                    {
                        spawn.room.memory.container_pos.push([source_pos, source.id]);
                        break
                    }
                }
                //Game.spawns["New New Orleans"].room.visual.circle(pos, {fill: 'transparent', radius: 0.55, stroke: 'red'});
            }
            // build containers for the first time
            for(i in spawn.room.memory.container_pos)
            {
                let pos = spawn.room.memory.container_pos[i];
                spawn.room.createConstructionSite(pos.x, pos.y, STRUCTURE_CONTAINER);
            }
        }

        // check length of container_pos and build if less containers are found
        // TODO: check if built already
        for(i in spawn.room.memory.container_pos)
        {
            let pos = spawn.room.memory.container_pos[i];
            spawn.room.createConstructionSite(pos[0].x, pos[0].y, STRUCTURE_CONTAINER);
        }


    }
};
