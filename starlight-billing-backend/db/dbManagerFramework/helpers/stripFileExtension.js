import { basename } from 'path';

const stripFileExtension = fileName => basename(fileName).split('.').slice(0, -1).join('');

export default stripFileExtension;
