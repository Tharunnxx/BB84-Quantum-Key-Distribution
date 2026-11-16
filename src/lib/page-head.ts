export function pageHead(title: string, description: string) {
  return { meta: [{ title: `${title} · QuantumLab BB84` }, { name: 'description', content: description }, { property: 'og:title', content: `${title} · QuantumLab BB84` }, { property: 'og:description', content: description }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' }] };
}