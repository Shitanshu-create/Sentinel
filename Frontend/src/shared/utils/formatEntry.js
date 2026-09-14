function htmlToText(value = '') {
  if (!value) return '';

  if (typeof document !== 'undefined') {
    const element = document.createElement('div');
    element.innerHTML = value;
    return (element.textContent || element.innerText || '').trim();
  }

  return value.replace(/<[^>]*>/g, '').trim();
}

export function formatEntry(backendEntry) {
  const content = backendEntry.chat || '';

  return {
    id: backendEntry._id,
    title: backendEntry.title || 'Untitled entry',
    date: new Date(backendEntry.date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }),
    content,
    preview: htmlToText(content),
    raw: backendEntry
  };
}
