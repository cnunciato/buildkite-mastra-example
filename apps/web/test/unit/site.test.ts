import { assert, expect, test, describe } from "vitest";
import { title } from "../../src/content/site";

describe("content", () => {
    test("site title", () => {
        expect(title).toBe("Astro Stuff");
    });
});
