import FilterOptions from 'interfaces/FilterOptions';
import Species from 'interfaces/Species';
import BaseRepository from './BaseRepository';
import Session from './Session';

export default class SpeciesRepository extends BaseRepository<Species> {
  constructor(session: Session) {
    super('tree_species', session);
  }

  async getByOrganization(organization_id: number, options: FilterOptions) {
    const { limit, offset } = options;
    const sql = `
      select species_id as id, count(species_id) as total, tree_species.name, tree_species.desc
      from trees
      LEFT JOIN tree_species 
      on trees.species_id = tree_species.id
      JOIN planter
      ON planter.id = trees.planter_id
      where 
      trees.active = true
      AND tree_species.name is not null
      AND trees.species_id is not null
      AND planter.organization_id IN (SELECT entity_id from getEntityRelationshipChildren(${organization_id}))
      group by species_id, tree_species.name, tree_species.desc
      order by total desc
      LIMIT ${limit}
      OFFSET ${offset}
    `;
    const object = await this.session.getDB().raw(sql);
    return object.rows;
  }

  async getByPlanter(planter_id: number, options: FilterOptions) {
    const { limit, offset } = options;
    const sql = `
      select species_id as id, count(species_id) as total, tree_species.name, tree_species.desc
      from trees
      LEFT JOIN tree_species 
      on trees.species_id = tree_species.id
      where 
      trees.active = true
      AND trees.planter_id = ${planter_id}
      AND tree_species.name is not null
      AND trees.species_id is not null
      group by species_id, tree_species.name, tree_species.desc
      order by total desc
      LIMIT ${limit}
      OFFSET ${offset}
    `;
    const object = await this.session.getDB().raw(sql);
    return object.rows;
  }

  async getByWallet(wallet_id: string, options: FilterOptions) {
    const { limit, offset } = options;
    const sql = `
      select species_id as id, count(species_id) as total, tree_species.name, tree_species.desc
      from trees
      LEFT JOIN tree_species 
      on trees.species_id = tree_species.id
      INNER JOIN wallet.token
      on wallet.token.capture_id::text = trees.uuid::text
      INNER JOIN wallet.wallet  
      on wallet.token.wallet_id = wallet.wallet.id
      where 
      trees.active = true
      AND wallet.wallet.id::text = '${wallet_id}'
      AND tree_species.name is not null
      AND trees.species_id is not null
      group by species_id, tree_species.name, tree_species.desc
      order by total desc
      LIMIT ${limit}
      OFFSET ${offset}
    `;
    const object = await this.session.getDB().raw(sql);
    return object.rows;
  }
}
