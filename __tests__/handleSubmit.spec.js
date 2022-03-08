/**
 * @jest-environment jsdom
 */

import { handleSubmit } from '../src/client/js/eventHandlers';

describe('Testing the handleSubmit function', () => {
	test('handleSubmit function exists', () => {
		expect(handleSubmit).toBeDefined();
	});
});
