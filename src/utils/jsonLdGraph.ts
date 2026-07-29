export interface GraphConflict {
  existingType?: string;
  id: string;
  newType?: string;
  reason: string;
}

export const createEntityRef = (id: string): { "@id": string } => ({
  "@id": id,
});

export const buildGraphSchema = (entities: Array<Record<string, unknown>>) => ({
  "@context": "https://schema.org" as const,
  "@graph": entities,
});

const isObject = (val: unknown): val is Record<string, unknown> =>
  typeof val === "object" && val !== null && !Array.isArray(val);

const deepMergeEntities = (
  target: Record<string, unknown>,
  source: Record<string, unknown>,
  visited = new Set<unknown>(),
): Record<string, unknown> => {
  if (visited.has(source)) {
    return target;
  }
  visited.add(source);

  const result = { ...target };

  Object.entries(source).forEach(([key, sourceValue]) => {
    if (sourceValue === undefined) {
      return;
    }

    const targetValue = result[key];

    if (targetValue === undefined) {
      result[key] = sourceValue;
    } else if (Array.isArray(targetValue) && Array.isArray(sourceValue)) {
      // Merge arrays without exact duplicate primitives
      const merged = [...targetValue];
      sourceValue.forEach((item) => {
        if (
          !merged.some(
            (existing) =>
              JSON.stringify(existing) === JSON.stringify(item),
          )
        ) {
          merged.push(item);
        }
      });
      result[key] = merged;
    } else if (isObject(targetValue) && isObject(sourceValue)) {
      result[key] = deepMergeEntities(targetValue, sourceValue, visited);
    } else {
      // Preference to new explicit source value
      result[key] = sourceValue;
    }
  });

  return result;
};

export class JsonLdGraph {
  private conflicts: GraphConflict[] = [];
  private registry = new Map<string, Record<string, unknown>>();
  private unidentifiedEntities: Array<Record<string, unknown>> = [];

  constructor(initialEntities?: Array<Record<string, unknown>>) {
    if (initialEntities?.length) {
      this.addEntities(initialEntities);
    }
  }

  public addEntity(entity: Record<string, unknown>): this {
    if (!isObject(entity)) {
      return this;
    }

    // Handle nested @graph input
    if (Array.isArray(entity["@graph"])) {
      (entity["@graph"] as Array<Record<string, unknown>>).forEach((item) =>
        this.addEntity(item),
      );
      return this;
    }

    const rawId = entity["@id"];

    if (typeof rawId === "string" && rawId.trim()) {
      const id = rawId.trim();
      const existing = this.registry.get(id);

      if (existing) {
        const existingType = String(existing["@type"] ?? "");
        const newType = String(entity["@type"] ?? "");

        if (existingType && newType && existingType !== newType) {
          this.conflicts.push({
            existingType,
            id,
            newType,
            reason: `Conflicting @type for entity id "${id}": expected "${existingType}", received "${newType}"`,
          });
        }

        const merged = deepMergeEntities(existing, entity);
        this.registry.set(id, merged);
      } else {
        this.registry.set(id, { ...entity });
      }
    } else {
      this.unidentifiedEntities.push({ ...entity });
    }

    return this;
  }

  public addEntities(entities: Array<Record<string, unknown>>): this {
    entities.forEach((entity) => this.addEntity(entity));
    return this;
  }

  public getConflicts(): GraphConflict[] {
    return [...this.conflicts];
  }

  public getEntity(id: string): Record<string, unknown> | undefined {
    return this.registry.get(id);
  }

  public hasEntity(id: string): boolean {
    return this.registry.has(id);
  }

  public toGraphObject(): { "@context": "https://schema.org"; "@graph": Array<Record<string, unknown>> } {
    // Sort registered entities deterministically by @id for SSR / hydration identity
    const sortedRegistered = Array.from(this.registry.entries())
      .sort(([idA], [idB]) => idA.localeCompare(idB))
      .map(([, entity]) => entity);

    const allEntities = [...sortedRegistered, ...this.unidentifiedEntities];

    // Sanitize cyclic references safely
    const seenObjects = new Set<unknown>();
    const sanitizeCyclic = (val: unknown): unknown => {
      if (isObject(val)) {
        if (seenObjects.has(val)) {
          return typeof val["@id"] === "string" ? { "@id": val["@id"] } : "[Circular]";
        }
        seenObjects.add(val);
        const copy: Record<string, unknown> = {};
        Object.entries(val).forEach(([k, v]) => {
          copy[k] = sanitizeCyclic(v);
        });
        return copy;
      }
      if (Array.isArray(val)) {
        return val.map((item) => sanitizeCyclic(item));
      }
      return val;
    };

    const sanitizedEntities = allEntities.map((e) =>
      sanitizeCyclic(e),
    ) as Array<Record<string, unknown>>;

    return buildGraphSchema(sanitizedEntities);
  }
}

export const createJsonLdGraph = (entities?: Array<Record<string, unknown>>) =>
  new JsonLdGraph(entities);
