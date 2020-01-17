/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('tower');
 * mod.thing == 'a thing'; // true
 */

module.exports =
{
    run(spawn)
    {
        // define range of tower
        // let range = 15;
        try{spawn.room.memory.turrets_set;}      // boolean
        catch(e){spawn.room.memory.turrets_set = false;}


        // BUILDING CONSTRUCTION SITE
        // get exits to each side
        // loop for every direction

        let directions = [FIND_EXIT_LEFT, FIND_EXIT_TOP, FIND_EXIT_BOTTOM, FIND_EXIT_RIGHT]
        try
        {
            if(!spawn.room.memory.turrets_set)
            {
                for(let i in directions)
                {
                    let count = 0;
                    let x_total = 0;
                    let y_total = 0;

                    let exit_coord = spawn.room.find(directions[i])
                    if(exit_coord.length > 0)
                    {
                        // TODO: get room level, calc number of max turrets compare, recalculate at room level increase

                        spawn.room.memory.turret_array = []; // array of coordinate
                        for(let element in exit_coord)
                        {
                            count++;
                            x_total = x_total + exit_coord[element].x;
                            y_total = y_total + exit_coord[element].y;
                        }
                        let x_coord = x_total / count;
                        let y_coord = y_total / count;
                        // modify coordinates according to site on map
                        if(directions[i] === FIND_EXIT_LEFT)
                        {
                            x_coord = x_coord + 5;
                        }
                        else if(directions[i] === FIND_EXIT_TOP)
                        {
                            y_coord = y_coord + 5;
                        }
                        else if(directions[i] === FIND_EXIT_RIGHT)
                        {
                            x_coord = x_coord - 5;
                        }
                        else if(directions[i] === FIND_EXIT_BOTTOM)
                        {
                            y_coord = y_coord - 5;
                        }
                        spawn.room.memory.turret_array.push([x_coord, y_coord]);
                        spawn.room.createConstructionSite(x_coord, y_coord, STRUCTURE_TOWER);


                        spawn.room.memory.turrets_set = true;
                    }

                }
            }
        }
        catch(e)
        {
            spawn.room.memory.turret_array = [];
            spawn.room.memory.turrets_set = false;
        }

        // build every 5000 ticks in case they were destroyed
        spawn.room.memory.tower_built_counter++;
        if(spawn.room.memory.tower_built_counter > 5000)
        {
            for(let turret in spawn.room.memory.turret_array)
            {
                spawn.room.createConstructionSite(turret[0], turret[1], STRUCTURE_TOWER);
            }
        }


        // ACTUAL TOWER CODE

        let hostiles = spawn.room.find(FIND_HOSTILE_CREEPS);
        if(hostiles.length > 0)
        {
            let username = hostiles[0].owner.username;
            console.log("hostile creep detected. By: ", username);
            let towers = spawn.room.find(
                FIND_MY_STRUCTURES, {filter: {structureType: STRUCTURE_TOWER}});
                towers.forEach(tower => tower.attack(hostiles[0]));
        }



    }
};
