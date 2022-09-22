/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('role.defender');
 * mod.thing == 'a thing'; // true
 */

module.exports =
{
    run(spawn)
    {
        let total_creep_count = 0;
        // loop through creeps

        let enemies = spawn.room.find(FIND_HOSTILE_CREEPS);

        for(let name in Game.creeps)
        {
            if (!name.includes("Defender") && !name.includes(spawn.name)) {continue;}
            let creep = Game.creeps[name];
            if(creep.attack(enemies[0]) === ERR_NOT_IN_RANGE)
            {
                creep.moveTo(enemies[0]);
            }

        }

        // Generate new Defender creep
        let creep_count = 0;
        for (let name in Game.creeps)
        {
            if (name.includes('Defender')) { creep_count++;}
        }

        // spawn if total number is smaller and there are enemies in the room
        if(Object.keys(Game.creeps).length > 1 && creep_count < total_creep_count && enemies.length > 0)
        {
            spawn.spawnCreep([ATTACK, ATTACK, MOVE, MOVE, TOUGH, MOVE, ATTACK, MOVE, MOVE, MOVE, ATTACK, MOVE, MOVE, ATTACK, ATTACK, MOVE, MOVE, 
            ATTACK, TOUGH, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, ATTACK, TOUGH, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, ATTACK, TOUGH, MOVE, MOVE, 
            MOVE, MOVE, MOVE, MOVE, ATTACK, TOUGH, MOVE, MOVE, ATTACK],
            spawn.name + '-' + 'Defender' + '-' + Game.time);
        }

    }
};
