export const up = async (migrationBuilder) => {
  await migrationBuilder.createExtension('public', 'postgis');

};

export const down = async (migrationBuilder) => {
  await migrationBuilder.dropExtension('postgis');
};
