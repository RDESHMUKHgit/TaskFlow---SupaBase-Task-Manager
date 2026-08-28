/**
 * Formats a date string into readable human format
 * @param {string|Date} dateString 
 * @returns {string} Formatted date (e.g. 'Oct 24, 2026')
 */
export const formatDate = (dateString) => {
  if (!dateString) return 'No due date';
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Invalid date';

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
};

/**
 * Checks if a due date is overdue
 * @param {string|Date} dateString 
 * @returns {boolean}
 */
export const isOverdue = (dateString) => {
  if (!dateString) return false;
  const due = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return due < today;
};

/**
 * Checks if due date is today
 * @param {string|Date} dateString 
 * @returns {boolean}
 */
export const isToday = (dateString) => {
  if (!dateString) return false;
  const due = new Date(dateString);
  const today = new Date();
  return due.toDateString() === today.toDateString();
};
