/*
 * Code for other Structures like containers
 */

module.exports =
{
    run(spawn)
    {
        // Storage
        try{spawn.room.memory.storage_counter++;}      // boolean
        catch(e){spawn.room.memory.storage_counter = 0;}

        // build storage one left of spawn
        if(!spawn.room.StructureStorage && spawn.room.memory.storage_counter > 1000)
        {
            console.log("trying to build storage");

            let x_coord = spawn.pos.x - 1;
            let y_coord = spawn.pos.y;

            let road = spawn.room.lookForAt(STRUCTURE_ROAD, x_coord, y_coord);
            if(road[0] && road[0].structureType === STRUCTURE_ROAD)
            {
                road.destroy();
            }

            spawn.room.createConstructionSite(x_coord, y_coord, STRUCTURE_STORAGE);

            spawn.room.memory.storage_counter = 0;
        }


    }
};