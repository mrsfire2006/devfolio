import { requireAuth } from '#lib/server/auth.helper.ts';
import { ServerResult } from '#lib/dtos/result.ts';
import { db } from '#lib/server/db/index.ts';
 import { imagekit } from '#lib/server/imagekit.ts';

import { and, eq } from 'drizzle-orm';
import { projectImages } from '#lib/server/db/schemas/project.schema.ts';

export const DELETE = requireAuth(async ({ params }) => {
	const { id: projectId, imageId } = params;

	if (!projectId || !imageId) {
		return Response.json(
			ServerResult.Failure('Project Id and Image Id are required.').GetClientResult(),
			{ status: 400 }
		);
	}

	try {
		// 1. Find the image and make sure it belongs to this project.
		const [existingImage] = await db
			.select({ id: projectImages.id, fileId: projectImages.fileId })
			.from(projectImages)
			.where(and(eq(projectImages.id, imageId), eq(projectImages.projectId, projectId)))
			.limit(1);

		if (!existingImage) {
			return Response.json(ServerResult.Failure('Image not found.').GetClientResult(), {
				status: 404
			});
		}

		// 2. Delete the database record first.
		await db
			.delete(projectImages)
			.where(and(eq(projectImages.id, imageId), eq(projectImages.projectId, projectId)));

		// 3. Delete the file from ImageKit (best effort).
		try {
			await imagekit.files.delete(existingImage.fileId);
		} catch (cleanupError) {
			// The DB record is already gone; log the orphaned file for manual cleanup.
			console.error('Failed to delete image from ImageKit:', existingImage.fileId, cleanupError);
		}

		return Response.json(ServerResult.Success({ id: imageId }).GetClientResult(), {
			status: 200
		});
	} catch (error) {
		console.error('Failed to delete project image:', error);

		return Response.json(ServerResult.Failure('Internal Server Error', 500).GetClientResult(), {
			status: 500
		});
	}
});
