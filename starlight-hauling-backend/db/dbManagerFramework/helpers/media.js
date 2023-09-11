/* eslint-disable no-invalid-this */
//it has to be called with the function call() and this is why it can use "this"
export function initMediaTable() {
  this.column('id').uuid();
  this.primary('id');
  this.column('url').text().notNullable();
  this.column('file_name').text();
  this.column('author').text();

  this.timestamps();

  this.addHistoricalTable({ uuidOriginal: true });
}
