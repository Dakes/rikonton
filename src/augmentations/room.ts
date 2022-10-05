import { Position } from "source-map";
import { VariableDeclaration } from "typescript";
import { Role } from "./creep";
import { positionSquare } from "helpers/positions";
import { populationPermit } from "spawner/population";

export { }
//import {Room} from "."

// Where to place central container compared to Spawn Nr.1
const CONT_OFFSET = [-2, 2];

const STORAGE_OFFSET = [-1, 0];

const TOWER_OFFSET = [[-2, 1], [-1, 2], [-2, 3], [-2, -1], [-1, -2], [-2, -3]]


declare global
{

    interface Room
    {
        memory: RoomMemory;
        readonly prototype: Room;
        getStore(store?:boolean): StructureSpawn | StructureContainer | StructureStorage | null;
        getSpawnPos(num?:number): RoomPosition;
        getCentralContPos(): RoomPosition;
        getCentralCont(): StructureContainer | null;
        getStoragePos(): RoomPosition;
        getTowerPositions(): RoomPosition[];
        myActiveStructures(struct?: StructureConstant|null): Structure[];
        _myActiveStructures?: Structure[];
        myStructures(struct?: StructureConstant|null): Structure[];
        _myStructures?: Structure[];
        allStructures(struct?: StructureConstant|null): Structure[];
        _allStructures?: Structure[];
        myConstructionSites(): ConstructionSite[];

        myExtensions(): StructureExtension[]; // technically not needed any more
        _myExtensions?: StructureExtension[]; // technically not needed any more
        mySpawns(): StructureSpawn[];         // technically not needed any more
        _mySpawns?: StructureSpawn[];         // technically not needed any more

        myCreeps(r?: Role | null): Creep[];
        _myCreeps?: Creep[];
        extensionsFull(): boolean;
        _extensionsFull?: boolean;
        spawnEnergy(): number;
        maxSpawnEnergy(): number;
        _maxSpawnEnergy?: number;
        droppedResources(): number;
        ruinResources(): number;

        // memory management
        initRoomMemory(): any;
        calcContainerPos(): boolean;
    }

    export interface ContainerPosition
    {
        "id": Id<StructureContainer> | null,  // Id of this Container
        "parentId": Id<Structure> | Id<Source>,  // Structure this container belongs to
        "use": string,  // Use case
        "pos": RoomPosition,  // Position where container should be
    }
    export interface RoomMemory extends Memory
    {
        ContainerPos: ContainerPosition[];
        populationNumber: typeof populationPermit;
        controllerLevel: number|undefined;
        // roads;
    }
}

Room.prototype.initRoomMemory = function ()
{
    this.memory.controllerLevel = this.controller?.level;
    // TODO: write first spawn coords to memory
    if (this.memory.ContainerPos === undefined)
    {
        console.log(`Initializing ${this.name}.memory.ContainerPos`);
        this.memory.ContainerPos = [];
    }

    if (this.memory.ContainerPos.length == 0)
        this.calcContainerPos();

    if (this.memory.populationNumber == undefined)
        this.memory.populationNumber = populationPermit;
}


Room.prototype.calcContainerPos = function ()
{
    if (!this.memory.ContainerPos.length)
    {
        console.log(`${this.name}: Calculating Container Positions`);
        const room_terrain = Game.map.getRoomTerrain(this.name);
        const sources = this.find(FIND_SOURCES);

        // Source containers
        for (let i in sources)
        {
            let source = sources[i];
            let source_positions_around = positionSquare(source.pos);
            //check for plain or swamp
            for (let i in source_positions_around)
            {
                let containerPos = source_positions_around[i];
                // 0 = plain, 1 = wall, 2 = swamp
                let terrain = room_terrain.get(containerPos.x, containerPos.y);
                if (terrain != TERRAIN_MASK_WALL)
                {
                    this.memory.ContainerPos.push(
                        {
                            "id": null,
                            "parentId": source.id as unknown as Id<Source>,
                            "use": "Miner Store",
                            "pos": containerPos,
                        }
                    );
                    break;
                }
            }
        }

        // center container
        // TODO: get spawn position algorithmically
        let spawn = this.mySpawns()[0];
        let x = spawn.pos.x;
        let y = spawn.pos.y;
        x += CONT_OFFSET[0];
        y += CONT_OFFSET[1];
        this.memory.ContainerPos.push(
            {
                "id": null,
                "parentId": spawn.id as Id<Structure>,
                "use": "Central Store",
                "pos": new RoomPosition(x, y, this.name),
            }
        );

    }
    return true;
}

Room.prototype.getSpawnPos = function (num:number|undefined=0)
{
    if (num == undefined)
        num = 0;
    let spawn = this.mySpawns()[num];
    return spawn.pos;
}

Room.prototype.getCentralContPos = function ()
{
    let spawnPos = this.getSpawnPos();
    return new RoomPosition(spawnPos.x+CONT_OFFSET[0], spawnPos.y+CONT_OFFSET[1], this.name);
}

// TODO: cache
Room.prototype.getCentralCont = function ()
{
    let containers: StructureContainer[] = this.allStructures(STRUCTURE_CONTAINER) as StructureContainer[];
    let centralContPos: RoomPosition = this.getCentralContPos();
    let contPos: ContainerPosition = this.memory.ContainerPos.filter((c) =>
        c.pos.x == centralContPos.x && c.pos.y == centralContPos.y)[0];
    for (let i in containers)
    {
        let cont = containers[i];
        if (cont.pos.x == contPos.pos.x && cont.pos.y == contPos.pos.y)
        {
            return cont;
        }
    }
    return null;
}

Room.prototype.getStoragePos = function ()
{
    let sp = this.getSpawnPos(0);
    return new RoomPosition(sp.x+STORAGE_OFFSET[0], sp.y+STORAGE_OFFSET[1], this.name);
}

Room.prototype.getTowerPositions = function ()
{
    let sp = this.getSpawnPos(0);
    let towerPos: RoomPosition[] = [];
    for (let i in TOWER_OFFSET)
        towerPos.push(new RoomPosition(sp.x+TOWER_OFFSET[i][0], sp.y+TOWER_OFFSET[i][1], this.name));
    return towerPos;
}

/**
 * Get the main storage of the room.
 * @param store: true: get store for storing. false: get store for retrieving. Default: true
 */
Room.prototype.getStore = function (store:boolean=true)
{
    let storage = this.storage;
    if (storage)
        return storage;

    let spawn: StructureSpawn = this.mySpawns()[0];

    let cont = this.getCentralCont();
    if (store && (!cont || spawn?.store.getFreeCapacity(RESOURCE_ENERGY) > 0))
        return spawn;
    if (store && cont && spawn && spawn.store.getFreeCapacity(RESOURCE_ENERGY) == 0)
        return cont;

    if (!store && cont && cont.store.getUsedCapacity(RESOURCE_ENERGY) != 0)
        return cont;

    if (!store && spawn && spawn.store.getUsedCapacity(RESOURCE_ENERGY) == 300)
        return spawn;
    else if (!store && cont)
        return cont;

    if (spawn)
        return spawn;
    return null;
};

Room.prototype.extensionsFull = function ()
{
    if (this._extensionsFull !== undefined)
        return this._extensionsFull
    let notFullExt: StructureExtension[] = _.filter(this.myExtensions(), (s: StructureExtension) =>
        s.store.getFreeCapacity(RESOURCE_ENERGY) != 0);
    if (notFullExt.length == 0)
        this._extensionsFull = true;
    else
        this._extensionsFull = false;
    return this._extensionsFull;
}

Room.prototype.mySpawns = function ()
{
    if (this._mySpawns !== undefined)
        return this._mySpawns;
    const spawns: StructureSpawn[] = this.myActiveStructures(STRUCTURE_SPAWN) as StructureSpawn[];
    this._mySpawns = spawns;
    return spawns;
}

Room.prototype.myExtensions = function ()
{
    if (this._myExtensions !== undefined)
        return this._myExtensions;
    const ext: StructureExtension[] = this.myActiveStructures(STRUCTURE_EXTENSION) as StructureExtension[];
    this._myExtensions = ext;
    return ext;
}


Room.prototype.spawnEnergy = function ()
{
    const ext = this.myExtensions();
    let spawnEnergy: number = 0;
    for (let i in ext)
        spawnEnergy += ext[i].store.getUsedCapacity(RESOURCE_ENERGY);
    const spawns = this.mySpawns();
    for (let i in spawns)
        spawnEnergy += spawns[i].store.getUsedCapacity(RESOURCE_ENERGY);

    return spawnEnergy;
}

Room.prototype.maxSpawnEnergy = function ()
{
    if (this._maxSpawnEnergy !== undefined)
        return this._maxSpawnEnergy
    let ext = this.myExtensions();
    let maxSpawnEnergy: number = 0;
    for (let i in ext)
        maxSpawnEnergy += ext[i].store.getCapacity(RESOURCE_ENERGY);
    const spawns = this.mySpawns();
    for (let i in spawns)
        maxSpawnEnergy += spawns[i].store.getCapacity(RESOURCE_ENERGY);

    this._maxSpawnEnergy = maxSpawnEnergy;
    return maxSpawnEnergy;
}

Room.prototype.myActiveStructures = function (struct:StructureConstant|null=null)
{
    if (this._myActiveStructures !== undefined)
    {
        if (struct != null)
            return _.filter(this._myActiveStructures, (s: Structure) =>
                s.structureType == struct) as Structure[];
        return this._myActiveStructures;
    }
    const result = _.filter(this.myStructures(), (s) => s.isActive());
    this._myActiveStructures = result;
    return this.myActiveStructures(struct);
}

Room.prototype.myStructures = function (struct?:StructureConstant)
{
    if (this._myStructures !== undefined)
    {
        if (struct != undefined)
            return _.filter(this._myStructures, (s: Structure) =>
                s.structureType == struct) as Structure[];
        return this._myStructures;
    }
    const result = this.find(FIND_MY_STRUCTURES);
    this._myStructures = result;
    return this.myStructures(struct);
}

Room.prototype.allStructures = function (struct?:StructureConstant)
{
    if (this._allStructures !== undefined)
    {
        if (struct != undefined)
            return _.filter(this._allStructures, (s: Structure) =>
                s.structureType == struct) as Structure[];
        return this._allStructures;
    }
    const result = this.find(FIND_STRUCTURES);
    this._allStructures = result;
    return this.allStructures(struct);
}

Room.prototype.myConstructionSites = function ()
{
    return this.find(FIND_MY_CONSTRUCTION_SITES);
}

Room.prototype.myCreeps = function (r:(Role|null)=null)
{
    if (this._myCreeps === undefined)
    {
        const result = this.find(FIND_MY_CREEPS);
        this._myCreeps = result;
    }
    if (r == null)
        return this._myCreeps

    return _.filter(this._myCreeps, function (c: Creep) { return c.memory.role == r })
}


Room.prototype.droppedResources = function ()
{
    let res = 0;
    let dropped = this.find(FIND_DROPPED_RESOURCES);
    for (let i in dropped)
        res += dropped[i].amount;

    return res;
}

Room.prototype.ruinResources = function ()
{
    let res = 0;
    let ruins = this.find(FIND_RUINS);
    for (let i in ruins)
        res += ruins[i].store.getUsedCapacity(RESOURCE_ENERGY);

    return res;
}

/*
Object.defineProperties(Room.prototype, {
  costMatrix: {
    configurable: true,
    get(this: Room & { _costMatrix?: CostMatrix }): CostMatrix {
      let costs = this._costMatrix;
      if (costs) {
        return costs;
      }
      const mem = this.memory._costMatrix;
      if (mem && mem.expiresAt > Game.time) {
        costs = PathFinder.CostMatrix.deserialize(mem.matrix);
      }
      if (!costs) {
        costs = buildCostMatrix(this);
        this.memory._costMatrix = { matrix: costs.serialize(), expiresAt: Game.time + 2 };
      }
      this._costMatrix = costs;
      return costs;
    }
  },
});

Room.prototype.toString = function(this: Room): string {
  return `[Room ${this.name}]`;
};

function buildCostMatrix(room: Room): CostMatrix {
  log.debug(`Building cost matrix for ${room}`);
  const costs = new PathFinder.CostMatrix();

  for (const s of room.find<Structure>(FIND_STRUCTURES)) {
    if (s.isRoad()) {
      costs.set(s.pos.x, s.pos.y, 1);
    } else if (!s.isTraversable()) {
      costs.set(s.pos.x, s.pos.y, 255);
    }
  }

  for (const creep of room.find<Creep>(FIND_CREEPS)) {
    costs.set(creep.pos.x, creep.pos.y, 255);
  }

  return costs;
}
*/
