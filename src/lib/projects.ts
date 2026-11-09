import { getCollection, type CollectionEntry } from 'astro:content';
import skillGroups from '../data/skill-groups.json';

export type Project = CollectionEntry<'projects'>;
export type DevopsProject = Project & { data: Extract<Project['data'], { type: 'devops' }> };
export type LabProject = Project & { data: Extract<Project['data'], { type: 'lab' }> };

const newestFirst = (a: Project, b: Project) => b.data.date.valueOf() - a.data.date.valueOf();

export async function getDevopsProjects(): Promise<DevopsProject[]> {
  const all = await getCollection('projects', (p) => p.data.type === 'devops');
  return (all as DevopsProject[]).sort(newestFirst);
}

export async function getLabProjects(): Promise<LabProject[]> {
  const all = await getCollection('projects', (p) => p.data.type === 'lab');
  return (all as LabProject[]).sort(newestFirst);
}

export const MAX_FEATURED = 3;

export async function getFeaturedProjects(): Promise<DevopsProject[]> {
  const featured = (await getDevopsProjects()).filter((p) => p.data.featured);
  if (featured.length > MAX_FEATURED) {
    throw new Error(
      `Too many featured projects: ${featured.length} files have "featured: true" ` +
        `(${featured.map((p) => p.id).join(', ')}). The home page shows at most ${MAX_FEATURED}.`,
    );
  }
  return featured;
}

/**
 * Skills come only from the `tools` of devops projects, so an unproven tool can never appear.
 * skill-groups.json only decides which group a tool sits in; unknown tools go to "Other".
 */
export async function getSkills(): Promise<{ group: string; tools: string[] }[]> {
  const used = new Map<string, string>(); // lowercase -> name as written in the project
  for (const p of await getDevopsProjects()) {
    for (const t of p.data.tools) if (!used.has(t.toLowerCase())) used.set(t.toLowerCase(), t);
  }
  const placed = new Set<string>();
  const groups = Object.entries(skillGroups as Record<string, string[]>).map(([group, tools]) => {
    const hits = tools.filter((t) => used.has(t.toLowerCase()));
    hits.forEach((t) => placed.add(t.toLowerCase()));
    return { group, tools: hits.map((t) => used.get(t.toLowerCase())!) };
  });
  const other = [...used.entries()].filter(([k]) => !placed.has(k)).map(([, v]) => v);
  if (other.length) groups.push({ group: 'Other', tools: other });
  return groups.filter((g) => g.tools.length > 0);
}

export const formatDate = (d: Date) =>
  d.toLocaleDateString('en-GB', { year: 'numeric', month: 'short', timeZone: 'UTC' });

export const isTodo = (s: string | null | undefined) => !s || /^\s*TODO/i.test(s);
