import * as classRepository from './class.repository.js';
import pool from '../../config/db.js';

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

/**
 * Retrieve all non-deleted classes.
 */
export const getClassesList = async () => {
  return await classRepository.getClassesList();
};

/**
 * Retrieve details of a single class.
 */
export const getClassById = async (id) => {
  const cls = await classRepository.getClassById(id);
  if (!cls) {
    throw new Error('Class not found');
  }
  return cls;
};

/**
 * Helper to slugify/clean class names for ID generation.
 * e.g. "Class Nursery" -> "nursery", "Class 5" -> "5", "O-Levels" -> "o-levels"
 */
const generateClassId = (name) => {
  let cleaned = name.trim().toLowerCase();
  
  // If it starts with "class ", remove that prefix
  if (cleaned.startsWith('class ')) {
    cleaned = cleaned.replace(/^class\s+/, '');
  }
  
  // Replace space and special characters with dash
  cleaned = cleaned.replace(/[^a-z0-9]/g, '-');
  
  // Remove duplicate dashes
  cleaned = cleaned.replace(/-+/g, '-');
  
  // Trim leading/trailing dashes
  cleaned = cleaned.replace(/^-+|-+$/g, '');
  
  return cleaned || 'class-' + Date.now();
};

/**
 * Create a new class with subjects.
 */
export const createClass = async (classData) => {
  // Check for duplicate class name
  const nameExists = await classRepository.checkClassNameExists(classData.name);
  if (nameExists) {
    throw new Error(`Class name "${classData.name}" already exists.`);
  }

  // Generate class ID if not supplied
  const id = classData.id ? classData.id.trim() : generateClassId(classData.name);

  // Check if class ID already exists (including deleted ones, to avoid conflict)
  const existingClass = await classRepository.getClassById(id);
  if (existingClass) {
    throw new Error(`Class with ID "${id}" already exists.`);
  }

  // Calculate display order if not specified
  let displayOrder = classData.displayOrder;
  if (displayOrder === undefined || displayOrder === null) {
    const maxOrder = await classRepository.getMaxDisplayOrder();
    displayOrder = maxOrder + 1;
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    await classRepository.createClass(client, {
      id,
      name: classData.name,
      displayOrder,
      isActive: classData.isActive !== undefined ? classData.isActive : true
    });

    if (classData.subjects && classData.subjects.length > 0) {
      await classRepository.addSubjectsToClass(client, id, classData.subjects);
    }

    await client.query('COMMIT');
    
    // Fetch full class with subjects for the response
    return await classRepository.getClassById(id);
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

/**
 * Update an existing class and its subjects.
 */
export const updateClass = async (id, classData) => {
  // Check if class exists
  const existingClass = await classRepository.getClassById(id);
  if (!existingClass) {
    throw new Error('Class not found');
  }

  // Check for duplicate name if it's changing
  if (classData.name && classData.name !== existingClass.name) {
    const nameExists = await classRepository.checkClassNameExists(classData.name, id);
    if (nameExists) {
      throw new Error(`Class name "${classData.name}" already exists.`);
    }
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    await classRepository.updateClass(client, id, classData);

    if (classData.subjects !== undefined) {
      // Clear all existing subjects first
      await classRepository.clearSubjectsForClass(client, id);
      
      // Add new subjects if array is not empty
      if (classData.subjects && classData.subjects.length > 0) {
        await classRepository.addSubjectsToClass(client, id, classData.subjects);
      }
    }

    await client.query('COMMIT');

    // Return the updated class including its subjects
    return await classRepository.getClassById(id);
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

/**
 * Soft delete a class.
 */
export const deleteClass = async (id) => {
  const deleted = await classRepository.softDeleteClass(id);
  if (!deleted) {
    throw new Error('Class not found or already deleted');
  }
  return true;
};
