import fs from 'fs';
import path from 'path';
import { TenantMigrationCreateCommand } from './commands/TenantMigrationCreateCommand';

const migrationsFolder = path.join(
  __dirname,
  '../',
  'src/modules/recycling/migrations'
);


const migrationFiles = fs.readdirSync(migrationsFolder);

const up: string[] = [];
const down: string[] = [];

migrationFiles.forEach((migrationFileName) => {
  const migrationFilePath = path.join(migrationsFolder, migrationFileName);

  const content = fs.readFileSync(migrationFilePath).toString('utf-8');
  const lines = content.split('\n');

  let afterSetSearchPath = false;
  let afterResetSearchPath = false;
  let isInUp = false;
  let isInDown = false;
  let shouldCollect = false;

  lines.forEach((line, lineIndex) => {
    if (/public async up/g.test(line)) {
      isInUp = true;

      return;
    }
    
    if (/public async down/g.test(line)) {
      console.log('down', isInUp);
      isInDown = true;

      return;
    }

    if (/SET LOCAL search_path TO public,postgis/g.test(line)) {
      afterResetSearchPath = true;
      shouldCollect = false;

      if (isInUp) {
        up.push(`    // END OF ${migrationFileName}\n`);
      } else if (isInDown) {
        down.push(`    // END OF ${migrationFileName}\n`);
      }

      return;
    }

    if (/SET LOCAL search_path TO \'\$\{/g.test(line)) {
      afterSetSearchPath = true;

      if (isInUp) {
        up.push(`    // BEGIN OF ${migrationFileName}\n`);
      } else if (isInDown) {
        down.push(`    // BEGIN OF ${migrationFileName}\n`);
      }

      return;
    }

    if (afterSetSearchPath && /await queryRunner/g.test(line)) {
      if (!shouldCollect) {
        shouldCollect = true;
      }
    }

    if (afterResetSearchPath) {
      afterResetSearchPath = false;

      if (isInUp && /\}/g.test(line)) {
        console.log('close up', line);
        isInUp = false;
  
        return;
      }
      
      if (isInDown && /\}/g.test(line)) {
        console.log('close down', line, lineIndex, migrationFileName);
        isInDown = false;
  
        return;
      }
    }

    if (shouldCollect) {
      if (isInUp) {
        up.push(line);

        return;
      }
      
      if (isInDown) {
        down.push(line);

        return;
      }
    }
  });
});

// console.log('migrationsFolder', migrationFiles, migrationFiles.length)

(async () => {
  const command = new TenantMigrationCreateCommand();

  console.log('migrationsFolder', migrationsFolder);

  const filepath = await command.handler({ name: 'Squashed', dir: 'src/modules/recycling/migrations', $0: '', _: [''] });

  if (!filepath) {
    return;
  }

  let content = fs.readFileSync(filepath).toString('utf-8');

  content = content.replace(/\/\/ here will go your code for "up"/g, up.join('\n'));
  content = content.replace(/\/\/ here will go your code for "down"/g, down.join('\n'));

  fs.writeFileSync(filepath, content);

  console.log('squashed in ', filepath);
})();