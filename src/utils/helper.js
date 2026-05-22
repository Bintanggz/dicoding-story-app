export function formatDate(dateString) {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '-';
    
    return new Intl.DateTimeFormat('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  } catch (e) {
    return dateString;
  }
}
