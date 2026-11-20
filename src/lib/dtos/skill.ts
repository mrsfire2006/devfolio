import * as z from 'zod';

// Base
export const skillSchema = z.object({
    id: z.string(),
    name: z.string(),
    description: z.string().nullable(),
    icon: z.string().nullable(),
    createdAt: z.date()
});

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