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


    }
};