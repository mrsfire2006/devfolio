import ImageKit from '@imagekit/nodejs';
import { IMAGEKIT_PRIVATE_KEY } from '$app/env/private';

if (!IMAGEKIT_PRIVATE_KEY) {
	throw new Error('IMAGEKIT_PRIVATE_KEY is not configured');
}

export const imagekit = new ImageKit({
	privateKey: IMAGEKIT_PRIVATE_KEY
});
