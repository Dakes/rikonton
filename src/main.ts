import {role} from "./augmentations/creep"
import { ErrorMapper } from "./utils/ErrorMapper";
// import { Game } from "../test/unit/mock";
import { spawnCreeps } from "./spawner";
import * as pMiner from "./roles/primitive_miner"
import * as miner from "./roles/miner"
import * as upgrader from "./roles/upgrader"
import './augmentations';

// legacy imports
import * as defenders from          "./roles/role.defender"
import * as constructors from       "./roles/role.constructor"
import * as miner_carriers from     "./roles/role.miner_carrier"
import * as carriers from           "./roles/role.carrier"
import * as extension_carriers from "./roles/role.extension_carrier"
// import * as primitive_miners from   "./roles/role.primitive_miner"
// import * as upgrader from           "./roles/role.upgrader"
// import * as miners from             "./roles/role.miner"
import * as roads from              "./roles/road"
import * as towers from             "./roles/tower"
import * as extensions from         "./roles/extension"
import * as structures from         "./roles/structures"



declare global
{
    /*
    Example types, expand on these or remove them and add your own.
    Note: Values, properties defined here do no fully *exist* by this type definiton alone.
    You must also give them an implemention if you would like to use them. (ex. actually setting a `role` property in a Creeps memory)

    Types added in this `global` block are in an ambient, global context. This is needed because `main.ts` is a module file (uses import or export).
    Interfaces matching on name from @types/screeps will be merged. This is how you can extend the 'built-in' interfaces from @types/screeps.
    */
    // Memory extension samples
    interface Memory
    {
        uuid: number;
        log: any;
    }
    /*
    interface CreepMemory
    {
        role: string;
        room: string;
        working: boolean;
    }
    */

    // Syntax for adding proprties to `global` (ex "global.log")
    namespace NodeJS
    {
        interface Global
        {
            log: any;
        }
    }
}

// When compiling TS to JS and bundling with rollup, the line numbers and file names in error messages change
// This utility uses source maps to get the line numbers and file names of the original, TS source code
export const loop = ErrorMapper.wrapLoop(() =>
{
    console.log(`Current game tick is ${Game.time}`);

    _.each(Game.rooms, manageRoom);
    clearMemory();
    genPixel();


});

function manageRoom(room: Room)
{
    spawnCreeps(room);

    /*
    try
    {
        spawnCreeps(room);
    } catch (ex)
    {
        console.log('Error during spawnCreeps:');
        console.log(ex);
    }
    */

    _.forEach(room.find(FIND_MY_CREEPS), (creep: Creep) => {
        switch (creep.memory.role)
        {
            case role.PMINER:
                pMiner.run(creep, room);
                break;
            case role.MINER:
                miner.run(creep, room);
                break;
            case role.UPGRADER:
                upgrader.run(creep, room);
                break;
        }
    });

    // legacy code
    let spawns = room.find(FIND_MY_SPAWNS);
    let spawn = spawns[Game.time%spawns.length];

    // miners.run(spawn);
    //defenders.run(spawn);
    // primitive_miners.run(spawn);

    miner_carriers.run(spawn);
    extension_carriers.run(spawn);
    constructors.run(spawn);
    carriers.run(spawn);
    // upgrader.run(spawn);

    roads.run(spawn);
    towers.run(spawn);
    structures.run(spawn);
    extensions.run(spawn);
    // legacy code END

    try
    {

    } catch (ex)
    {
        console.log('Error during Creep code execution');
        console.log(ex);
    }



    /*

    try
    {
        manageTowers(room);
    } catch (ex)
    {
        console.log('Error during manageTowers');
        console.log(ex);
    }
    */
}

function clearMemory()
{
    // Automatically delete memory of missing creeps
    if (Game.time % 10 == 0)
        for (const name in Memory.creeps)
            if (!(name in Game.creeps))
                delete Memory.creeps[name];
}

function genPixel()
{
    try
    {
        if(Game.cpu.bucket > 9000)
            Game.cpu.generatePixel();
    }
    catch(err){}
}
