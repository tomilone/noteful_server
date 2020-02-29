const NotesService = {
    getAllNotes(knex) {
      return knex.select("*").from("notes")
    },
    getById(knex, id) {
      return knex
        .from('notes')
        .select("*")
        .where({ id })
        .first()
    },
    insertNotes(knex, newNotes) {
      return knex
        .insert(newNotes)
        .into('notes')
        .returning("*")
        .then(rows => {
          return rows[0]
        })
    },
    deleteNotes(knex, id) {
      return knex("notes")
        .where({ id })
        .delete()
    },
    updateNotes(knex, id, newNotesFields) {
      return knex("notes")
        .where({ id })
        .update(newNotesFields)
    }
  }

  module.exports = NotesService;