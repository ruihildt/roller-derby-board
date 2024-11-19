export const version = `${import.meta.env.PACKAGE_VERSION}`;
export const buildDate = new Date(import.meta.env.BUILD_DATE)
	.toLocaleDateString('en-US', {
		year: 'numeric',
		month: '2-digit'
	})
	.split('/')
	.reverse()
	.join('.');
