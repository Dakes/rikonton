import { VariableDeclaration } from "typescript";

export {}
//import {Room} from "."
declare global {
    interface Room
    {
        readonly prototype: Room;
        getStore(): StructureSpawn | StructureContainer | StructureStorage | null;
        getMyStructures(struct: StructureConstant, cache: VariableDeclaration): Structure[];
        myActiveStructures(): Structure[];
        _myActiveStructures?: Structure[];
        myStructures(): Structure[];
        _myStructures?: Structure[];
        myExtensions(): StructureExtension[];
        _myExtensions?: StructureExtension[];
        mySpawns(): StructureSpawn[];
        _mySpawns?: StructureSpawn[];
        myCreeps(): Creep[];
        _myCreeps?: Creep[];
        extensionsFull(): boolean;
        _extensionsFull?: boolean;
        spawnEnergy(): number;
        maxSpawnEnergy(): number;
        _maxSpawnEnergy?: number;
    }
}

/*
Object.defineProperties(Room.prototype, {
    myStructures: {get(this: Room & {_myStructures?: Structure[]}): Structure[] {
            if (this._myStructures !== undefined)
                return this._myStructures;
            const result = this.find(FIND_MY_STRUCTURES);
            this._myStructures = result;
            return result
        }
    },
    myActiveStructures: {
        configurable: true,
        get(this: Room & { _myActiveStructures?: Structure[] }): Structure[] {
            if (this._myActiveStructures !== undefined)
                return this._myActiveStructures;
            const result: Structure[] = _.filter(this.myStructures, (s) => s.isActive());
            this._myActiveStructures = result;
            return result;
        }
    },

});
*/


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
        s.store.getFreeCapacity() != 0);
    if (notFullExt.length == 0)
        this._extensionsFull = true;
    else
        this._extensionsFull = false;
    return this._extensionsFull;
}

/*
Room.prototype.getMyStructures = function (struct: StructureConstant, cache: VariableDeclaration)
{
    if (cache !== undefined)
        return cache;
    const ext: StructureExtension[] = _.filter(this.myActiveStructures(), (s: Structure) =>
        s.structureType == STRUCTURE_EXTENSION) as StructureExtension[];
    this._myExtensions = ext;
    return ext;
}*/

Room.prototype.mySpawns = function ()
{
    if (this._mySpawns !== undefined)
        return this._mySpawns;
    const find: StructureSpawn[] = _.filter(this.myActiveStructures(), (s: Structure) =>
        s.structureType == STRUCTURE_SPAWN) as StructureSpawn[];
    this._mySpawns = find;
    return find;
}

Room.prototype.myExtensions = function ()
{
    if (this._myExtensions !== undefined)
        return this._myExtensions;
    const ext: StructureExtension[] = _.filter(this.myActiveStructures(), (s: Structure) =>
        s.structureType == STRUCTURE_EXTENSION) as StructureExtension[];
    this._myExtensions = ext;
    return ext;
}


Room.prototype.spawnEnergy = function ()
{
    let ext = this.myExtensions();
    let spawnEnergy: number = 0;
    for (let i in ext)
        spawnEnergy += ext[i].store.getUsedCapacity(RESOURCE_ENERGY);
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
    this._maxSpawnEnergy = maxSpawnEnergy;
    return maxSpawnEnergy;

}


Room.prototype.myActiveStructures = function ()
{
    if (this._myActiveStructures !== undefined)
        return this._myActiveStructures;
    const result = _.filter(this.myStructures(), (s) => s.isActive());
    this._myActiveStructures = result;
    return result;
}

Room.prototype.myStructures = function ()
{
    if (this._myStructures !== undefined)
        return this._myStructures;
    const result = this.find(FIND_MY_STRUCTURES);
    this._myStructures = result;
    return result
}

Room.prototype.myCreeps = function ()
{
    if (this._myCreeps !== undefined)
        return this._myCreeps;
    const result = this.find(FIND_MY_CREEPS);
    this._myCreeps = result;
    return result
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
