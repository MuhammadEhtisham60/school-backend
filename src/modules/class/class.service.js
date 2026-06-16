import * as classRepository from './class.repository.js';

/**
 * Get all active classes formatted for the dropdown selection.
 * @returns {Promise<object[]>} Array of classes with _id and name.
 */
export const getClassesDropdown = async () => {
  const classes = await classRepository.getClassesDropdown();
  return classes.map((c) => ({
    _id: c.id,
    name: c.name,
  }));
};
