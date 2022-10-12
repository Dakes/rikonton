import {Role} from "./augmentations/creep"
import { ErrorMapper } from "./utils/ErrorMapper";
// import { Game } from "../test/unit/mock";
import { spawnCreeps } from "./spawner";
import * as pMiner from "./roles/primitive_miner"
import * as miner from "./roles/miner"
import * as upgrader from "./roles/upgrader"
import * as carrier from "./roles/carrier"
import * as constructor from "./roles/constructor"
import * as room from "./augmentations/room"
import './augmentations';

import { constructContainers, constructStorage } from "structures/store";

// legacy imports
import * as defenders from          "./roles/role.defender"
import * as roads from              "./roles/road"
import { constructTowers, manageTowers } from "structures/tower";
import { updateAllCreepNumbers } from "spawner/population";
import { constructExtensions } from "structures/extension";



declare global
{
    interface Memory
    {
        uuid: number;
        log: any;
    }

    // Syntax for adding proprties to `global` (ex "global.log")
    namespace NodeJS
    {
        interface Global
        {
            log: any;
        }
    }
}

_.forEach(Game.rooms, (r: Room) => {
    r.initRoomMemory();
    constructStructures(r);
});

// When compiling TS to JS and bundling with rollup, the line numbers and file names in error messages change
// This utility uses source maps to get the line numbers and file names of the original, TS source code
export const loop = ErrorMapper.wrapLoop(() =>
{
    console.log();
    console.log(`Current game tick is ${Game.time}`);

    _.each(Game.rooms, manageRoom);
    clearMemory();
    genPixel();


});

function manageRoom(room: Room)
{

    try
    {
        spawnCreeps(room);
    } catch (ex)
    {
        console.log('Error during spawnCreeps:');
        console.log(ex);
    }

    _.forEach(room.find(FIND_MY_CREEPS), (creep: Creep) => {
        try {
            switch (creep.memory.role)
            {
                case Role.PMINER:
                    pMiner.run(creep, room);
                    break;
                case Role.MINER:
                    miner.run(creep, room);
                    break;
                case Role.UPGRADER:
                    upgrader.run(creep, room);
                    break;
                case Role.ECARRIER:
                    carrier.runExtensionCarrier(creep, room);
                    break;
                case Role.MCARRIER:
                    carrier.runMinerCarrier(creep, room);
                    break;
                case Role.CARRIER:
                    carrier.runCarrier(creep, room);
                    break;
                case Role.CONSTRUCTOR:
                    constructor.run(creep, room);
                    break;
            }
        }
        catch (ex)
        {
            console.log(`Error in ${creep.memory.role} execution: `, ex);
        }

    });

    constructStructures(room);


    // legacy code
    let spawns = room.find(FIND_MY_SPAWNS);
    let spawn = spawns[Game.time%spawns.length];
    defenders.run(spawn);

/*
    //defenders.run(spawn);

    miner_carriers.run(spawn);
    carriers.run(spawn);

    roads.run(spawn);
    towers.run(spawn);
    structures.run(spawn);
    extensions.run(spawn);
    // legacy code END
*/

    try
    {
        manageTowers(room);
    } catch (ex)
    {
        console.log('Error during manageTowers');
        console.log(ex);
    }
}

function constructStructures(room: Room)
{
    const mod = 1207;
    let t = Game.time;
    // on controller update rebuild structures
    if (room.controller?.level && room.memory.controllerLevel &&
        room.controller.level > room.memory.controllerLevel)
    {
        room.memory.controllerLevel = room.controller.level;
        t = mod;
    }
    if (t % mod == 0)
    {
        constructContainers(room);
        constructTowers(room);
        constructExtensions(room);
        updateAllCreepNumbers(room);
    }
    if (t % (mod*10) == 0)
    {
        constructStorage(room);
    }
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
        if(Game.cpu.bucket > 9500)
            Game.cpu.generatePixel();
    }
    catch(err){}
}
