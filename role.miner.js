module.exports =
{
    run(spawn)
    {
        let sources = spawn.room.find(FIND_SOURCES);
        let total_creep_count = Object.keys(sources).length;

        for (let name in Game.creeps)
        {
            if (!name.includes("Miner-"))
            {
                continue;
            }
            let creep = Game.creeps[name];

            try{creep.memory.source_id.valueOf();}
            catch(e)
            {
                creep.memory.source_id = false;
            }

            // set source in memory
            if(creep.memory.source_id === false)
            {
                for (let i in sources)
                {
                    let source = sources[i];
                    // iterate through miners, next if miner has source id
                    let occupied = false;
                    for (let name2 in Game.creeps)
                    {
                        if (!name2.includes("Miner-")){continue;}
                        if(Game.creeps[name2].memory.source_id === source.id){occupied = true;}
                    }
                    if(occupied === false)
                    {
                        creep.memory.source_id = source.id;
                        break;
                    }
                    // if (creep.memory.source_id !== false){break;}
                }
            }

            if (creep.memory.source_id !== false)
            {
                let source = Game.getObjectById(creep.memory.source_id)
                if (creep.harvest(source) === ERR_NOT_IN_RANGE)
                {
                    creep.moveTo(source);
                }
            }

        }

        // calculate the number of maximum work parts
        // Energy amount	4000 in center rooms
        // 3000 in an owned or reserved room
        // 1500 in an unreserved room

        if (typeof spawn.room.memory.miner_parts === "undefined")
        {
            spawn.room.memory.miner_parts = false;
        }

        if (spawn.room.memory.miner_parts === false || Object.keys(spawn.room.memory.miner_parts).length < 4)
        {
            console.log("recalculating miner_parts");
            let source = sources[0];
            let source_energy = source.energyCapacity;
            let regeneration = 300;
            // one work part harvests 2 per tick
            let work_parts = (source_energy / regeneration) / 2;
            spawn.room.memory.miner_parts = [];
            spawn.room.memory.miner_parts.push(MOVE);
            for(let i=0; i < work_parts; i++)
            {
                spawn.room.memory.miner_parts.push(WORK);
            }
        }

        // for i in sources

        let miner_creeps = 0;
        for (let name in Game.creeps)
        {
            // if source name in creep name, ++ next
            if (name.includes('Miner-')) { miner_creeps++;}
        }


        if(miner_creeps < total_creep_count && Object.keys(Game.creeps).length > 3)
        {

            let parts = Array.from(spawn.room.memory.miner_parts);
            let part_length = Object.keys(spawn.room.memory.miner_parts).length - 1;

            for (let i = 0; i < part_length; i++)
            {
                let success = spawn.spawnCreep(parts,
                    spawn.name + '-' + 'Miner' + '-' + Game.time);
                if(success === OK){console.log("Spawning Miner: ", parts);return;}
                if(success === ERR_NOT_ENOUGH_ENERGY){parts.pop();}
                if(success === ERR_BUSY){return;}
                if(parts.length < 3){return;}
            }
        }
    }
};
