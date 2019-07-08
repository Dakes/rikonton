module.exports =
{
    run(spawn)
    {
        let sources = spawn.room.find(FIND_SOURCES);
        let total_creep_count = Object.keys(sources).length;


        for(let name in Game.creeps)
        {
            if (!name.includes("Miner-")){continue;}
            let creep = Game.creeps[name];
            // TODO: get fixed position of source in the beginning and place them on fixed paths
            if(creep.harvest(sources[0]) === ERR_NOT_IN_RANGE)
            {
               creep.moveTo(sources[0]);
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
            spawn.spawnCreep([MOVE, WORK, WORK],
            spawn.name + '-' + 'Miner' + '-' + Game.time);
        }
    }
};
