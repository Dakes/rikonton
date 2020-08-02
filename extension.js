
module.exports =
{
    run(spawn)
    {
        let level_extensions = {
          1: 0,
          2: 5,
          3: 10,
          4: 20,
          5: 30,
          6: 40,
          7: 50,
          8: 60,
        };

        let rc_level = spawn.room.controller.level;
        const extensions = spawn.room.find(FIND_MY_STRUCTURES, {
            filter: { structureType: STRUCTURE_EXTENSION }
        });

        // build extensions in clusters of 5 surrounded by streets in triangle shape to the left of Spawn
        let begin_coord = spawn.pos;
        begin_coord.x = begin_coord.x - 2;

        // build extensions, if count is too low for rc level
        if (level_extensions[rc_level] > extensions.length)
        {
            let cluster_count = level_extensions[rc_level]/5;
            let level_count = Math.ceil((cluster_count-1) /2 ) - 1;
            if (cluster_count = 1){level_count = 0;}

            build_diamond_shape(level_count, begin_coord);

        }

        // console.log(myFunction(5, 4));
        /**
         * builds (expands) the bigger diamond shape for current level, each level has 2 more clusters
         * @param cluster_count The number of cluster, that still need to be built
         * @param level The nth "shell" of the shape
         */
        function build_diamond_shape(level, start_pos)
        {
            // cluster count is level *2 + 1 if level starts at 0.
            cluster_count = level * 2 + 1;

            total_cluster_count = 0;
            for (let i=0; i<level+1; i++){total_cluster_count += i * 2 + 1}
            // console.log(total_cluster_count);

            let cur_extensions = spawn.room.find(FIND_MY_STRUCTURES, {
                            filter: function(object){return object.structureType === STRUCTURE_EXTENSION}
                    });
            cluster_built = cur_extensions.length/5;

            let cur_pos = new RoomPosition(start_pos.x, start_pos.y, start_pos.roomName);
            cur_pos.x = cur_pos.x - level*2;
            cur_pos.y = cur_pos.y - level*2;

            for (let i=0; i<cluster_count; i++)
            {
                if (cluster_built > total_cluster_count)
                {
                    break;
                }
                if (i === 0){}
                else if ( i <= Math.round(cluster_count/2) )
                {
                    cur_pos.x = cur_pos.x - 2;
                    cur_pos.y = cur_pos.y + 2;
                }
                else
                {
                    cur_pos.x = cur_pos.x + 2;
                    cur_pos.y = cur_pos.y + 2;
                }

                // pass a copy
                let cur_pos_cpy = new RoomPosition(cur_pos.x, cur_pos.y, cur_pos.roomName);
                build_street_square(cur_pos_cpy);
                build_extensions(cur_pos_cpy);
                cluster_built += 5;
            }

            if (level > 0)
            {
                build_diamond_shape(level - 1, start_pos);
            }
        }

        /**
         * Builds streets in a diamond shape of 3x3 to the left from start_pos
         * @param start_pos Position of the first street structure of one cluster
         */
        function build_street_square(start_pos)
        {
            let street_positions = [];
            // street_positions.push(start_pos);
            // street_positions.push();
            for (let i = 0; i < 5; i++)
            {
                let new_street_high = new RoomPosition(start_pos.x, start_pos.y, start_pos.roomName);
                let new_street_low = new RoomPosition(start_pos.x, start_pos.y, start_pos.roomName);

                new_street_high.x = new_street_high.x - i;
                new_street_low.x = new_street_low.x - i;
                if (i === 1 || i === 3)
                {
                    new_street_high.y = new_street_high.y + 1;
                    new_street_low.y = new_street_low.y - 1;
                }
                else if (i === 2)
                {
                    new_street_high.y = new_street_high.y + 2;
                    new_street_low.y = new_street_low.y - 2;
                }

                street_positions.push(new_street_high);
                street_positions.push(new_street_low);
            }
            for (let i in street_positions)
            {
                let street_pos = street_positions[i];
                street_pos.createConstructionSite(STRUCTURE_ROAD);
            }
        }

        /**
         * fills a street square with extensions
         * @param start_pos Position of the first street structure of one cluster
         */
        function build_extensions(start_pos)
        {
            start_pos.x = start_pos.x - 1;
            start_pos.createConstructionSite(STRUCTURE_EXTENSION);
            start_pos.x = start_pos.x - 1;
            start_pos.createConstructionSite(STRUCTURE_EXTENSION);
            start_pos.y = start_pos.y - 1;
            start_pos.createConstructionSite(STRUCTURE_EXTENSION);
            start_pos.y = start_pos.y + 2;
            start_pos.createConstructionSite(STRUCTURE_EXTENSION);
            start_pos.y = start_pos.y - 1;
            start_pos.x = start_pos.x - 1;
            start_pos.createConstructionSite(STRUCTURE_EXTENSION);
        }
    }


}