import { Position } from "source-map";
import { VariableDeclaration } from "typescript";
import { role } from "./creep";
import { positionSquare } from "helpers/positions";

export { }
//import {Room} from "."
declare global
{
    interface Room
    {
        memory: RoomMemory;
        readonly prototype: Room;
        getStore(): StructureSpawn | StructureContainer | StructureStorage | null;
        myActiveStructures(struct?: StructureConstant|null): Structure[];
        _myActiveStructures?: Structure[];
        myStructures(struct?: StructureConstant|null): Structure[];
        _myStructures?: Structure[];

        myExtensions(): StructureExtension[]; // technically not needed any more
        _myExtensions?: StructureExtension[]; // technically not needed any more
        mySpawns(): StructureSpawn[];         // technically not needed any more
        _mySpawns?: StructureSpawn[];         // technically not needed any more

        myCreeps(r: role | null): Creep[];
        _myCreeps?: Creep[];
        extensionsFull(): boolean;
        _extensionsFull?: boolean;
        spawnEnergy(): number;
        maxSpawnEnergy(): number;
        _maxSpawnEnergy?: number;

        // memory management
        initRoomMemory(): any;
        calcContainerPos(): boolean;
    }

    export interface ContainerPosition
    {
        "id": Id<StructureContainer> | null,  // Id of this Container
        "parentId": Id<Structure>,  // Structure this container belongs to
        "use": string,  // Use case
        "pos": RoomPosition,  // Position where container should be
    }
    export interface RoomMemory extends Memory
    {
        ContainerPos: ContainerPosition[];
        // roads;
    }
}

Room.prototype.initRoomMemory = function ()
{
    try
    {
        this.memory.ContainerPos;
    }
    catch (ex)
    {
        this.memory.ContainerPos = [];
        this.calcContainerPos();
    }
}


Room.prototype.calcContainerPos = function ()
{
    if (!this.memory.ContainerPos.length)
    {
        console.log("Setting Container Positions");
        const room_terrain = Game.map.getRoomTerrain(this.name);
        const sources = this.find(FIND_SOURCES);

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
                            "parentId": source.id as unknown as Id<Structure>,
                            "use": "Miner Store",
                            "pos": containerPos,
                        }
                    );
                    break;
                }
            }
        }
    }
    return true;
}

/**
 * Get the main storage of the room.
 */
Room.prototype.getStore = function ()
{
    let storage = this.storage;
    if (storage)
        return storage;
    let spawns: StructureSpawn[] = this.mySpawns();
    for (let i in spawns)
    {
        if (spawns[i].store.getFreeCapacity(RESOURCE_ENERGY) > 0)
            return spawns[i]
    }
    // TODO: add intermediate container next to spawn, until storage is built
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

Room.prototype.myStructures = function (struct:StructureConstant|null=null)
{
    if (this._myStructures !== undefined)
    {
        if (struct != null)
            return _.filter(this._myStructures, (s: Structure) =>
                s.structureType == struct) as Structure[];
        return this._myStructures;
    }
    const result = this.find(FIND_MY_STRUCTURES);
    this._myStructures = result;
    return this.myStructures(struct);
}

Room.prototype.myCreeps = function (r:(role|null)=null)
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
