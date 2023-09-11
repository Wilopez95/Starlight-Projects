import minimatch from 'minimatch';

/**
 * `matchesResource` is a function that takes two strings and returns a boolean
 * @param {string} srn1 - The resource name of the first resource.
 * @param {string} srn2 - The resource name to match against.
 * @returns A boolean value.
 */
export const matchesResource = (srn1: string, srn2: string): boolean => minimatch(srn1, srn2);
