import fs from 'fs';
import yaml from 'js-yaml';
import { join } from 'path';
import { cwd } from 'process';

const yamlData = fs.readFileSync(join(cwd(), 'apidocs/swagger.yaml'), 'utf8');
export default yaml.safeLoad(yamlData);
