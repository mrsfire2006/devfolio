import { requireAuth } from '#lib/server/auth.helper.ts';
import { ServerResult } from '#lib/dtos/result.ts';
import { db } from '#lib/server/db/index.ts';
 import { imagekit } from '#lib/server/imagekit.ts';

import { eq } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import { project, projectImages } from '#lib/server/db/schemas/project.schema.ts';

const allowedTypes = {
	'image/jpeg': 'jpg',
	'image/png': 'png',
	'image/webp': 'webp'
} as const;

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB

export const POST = requireAuth(async ({ params, request }) => {
	const projectId = params.id;

	if (!projectId) {
		return Response.json(ServerResult.Failure('Project Id is required.').GetClientResult(), {
			status: 400
		});
	}

	let uploadedFileId: string | undefined;

	try {
		// 1. Check that the project exists.
		const [existingProject] = await db
			.select({ id: project.id })
			.from(project)
			.where(eq(project.id, projectId))
			.limit(1);

		if (!existingProject) {
			return Response.json(ServerResult.Failure('Project not found.').GetClientResult(), {
				status: 404
			});
		}

		// 2. Read multipart/form-data.
		let formData: FormData;

		try {
			formData = await request.formData();
		} catch {
			return Response.json(ServerResult.Failure('Invalid form data.').GetClientResult(), {
				status: 400
			});
		}

		const image = formData.get('image');
		

		if (!(image instanceof File) || image.size === 0) {
			return Response.json(ServerResult.Failure('Image is required.').GetClientResult(), {
				status: 400
			});
		}

		// 3. Validate image type and size.
		if (
			!Object.prototype.hasOwnProperty.call(allowedTypes, image.type) ||
			image.size > MAX_IMAGE_SIZE
		) {
			return Response.json(
				ServerResult.Failure(
					'Only JPEG, PNG, and WebP images up to 5 MB are allowed.'
				).GetClientResult(),
				{ status: 400 }
			);
		}

		const extension = allowedTypes[image.type as keyof typeof allowedTypes];

		// 4. Upload image to ImageKit.
		const uploaded = await imagekit.files.upload({
			file: image,
			fileName: `project-${randomUUID()}.${extension}`,
			folder: '/devfolio'
		});

		const { fileId, url } = uploaded;
		if (!fileId || !url) {
			throw new Error('ImageKit did not return the uploaded image URL and file ID.');
		}

		uploadedFileId = fileId;

		// 5. Save image metadata in PostgreSQL.
		const [savedImage] = await db
			.insert(projectImages)
			.values({
				id: randomUUID(),
				projectId,
				url,
				fileId,
			})
			.returning();

		if (!savedImage) {
			throw new Error('Failed to save project image in database.');
		}

		// Database insert succeeded; don't delete the uploaded image.
		uploadedFileId = undefined;

		return Response.json(ServerResult.Success(savedImage).GetClientResult(), { status: 201 });
	} catch (error) {
		console.error('Failed to add project image:', error);

		// 6. Roll back the external upload if database insertion failed.
		if (uploadedFileId) {
			try {
				await imagekit.files.delete(uploadedFileId);
			} catch (cleanupError) {
				console.error('Failed to delete uploaded image:', cleanupError);
			}
		}

		return Response.json(ServerResult.Failure('Internal Server Error', 500).GetClientResult(), {
			status: 500
		});
	}
});
