import { skillSchema } from '#lib/schemas/skill.schema.ts';
import * as z from 'zod';

 
// Create
export const createSkillSchema = skillSchema.pick({
    name: true,
    description: true,
    icon: true
});

export type CreateSkill = z.infer<typeof createSkillSchema>;

// Edit
export const editSkillSchema = createSkillSchema.partial();

export type EditSkill = z.infer<typeof editSkillSchema>;

// Public
export const skillCardSchema = skillSchema.omit({
    createdAt: true
});

export type SkillCard = z.infer<typeof skillCardSchema>;