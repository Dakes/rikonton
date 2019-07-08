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
            if (typeof creep.memory.source === "undefined")
            {
                creep.memory.source = false;
            }
            if (typeof spawn.room.memory.occupied_sources === "undefined")
            {
                spawn.room.memory.occupied_sources = [];
            }

            // delete miner and free memory, if health is too low
            if (creep.ticksToLive < 20)
            {
                for (let i in spawn.room.memory.occupied_sources)
                {
                    if (spawn.room.memory.occupied_sources[i] === creep.memory.source)
                    {
                        spawn.room.memory.occupied_sources.splice(i, 1);
                    }
                }
                creep.memory.source = false;
                creep.suicide();
            }


            // set sources in memory
            for (let i in sources)
            {
                let source = sources[i];

                // TODO: check this
                // if source is in memory, it is occupied by miner
                if (source in spawn.room.memory.occupied_sources)
                {
                    continue;
                }

                if (creep.memory.source === false)
                {
                    creep.memory.source = source;
                    spawn.room.memory.occupied_sources.push(source);
                }

            }

            if (creep.memory.source !== false)
            {
                // TODO: use ids instead, you idiot
                let x = creep.memory.source.pos.x;
                let y = creep.memory.source.pos.y;
                let source = spawn.room.lookForAt(LOOK_SOURCES, x, y)[0];
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

        if (spawn.room.memory.miner_parts === false)
        {
            let source = sources[0];
            let source_energy = source.energyCapacity;
            let regeneration = 300;
            // one work part harvests 2 per tick
            let work_parts = (source_energy / regeneration) / 2;
            spawn.room.memory.miner_parts = [];
            spawn.room.memory.miner_parts.push(MOVE);
            for(let i=0; i<work_parts; i++)
            {
                spawn.room.memory.miner_parts.push(WORK);
            }
        }


        let miner_creeps = 0;
        for (let name in Game.creeps)
        {
            if (name.includes('Miner-')) { miner_creeps++;}
        }

        // TODO: generate dynamically with howmuch energy is available
        if(miner_creeps < total_creep_count && Object.keys(Game.creeps).length > 3)
        {
            let miner_parts = spawn.room.memory.miner_parts;
            let part_length = Object.keys(spawn.room.memory.miner_parts).length - 1;

            for (let i = 0; i < part_length; i++)
            {
                let success = spawn.spawnCreep(miner_parts,
                    spawn.name + '-' + 'Miner' + '-' + Game.time);
                if(success === OK){return;}
                if(success === ERR_NOT_ENOUGH_ENERGY){miner_parts.pop();}
                if(success === ERR_BUSY){return;}
            }
        }
    }
};
