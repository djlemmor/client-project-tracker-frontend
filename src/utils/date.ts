export const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return '-'

  const date = new Date(dateString)
  if (isNaN(date.getTime())) return '-'

  // Customize the format as you like
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short', // "Aug"
    day: 'numeric',
  }).format(date)
}
