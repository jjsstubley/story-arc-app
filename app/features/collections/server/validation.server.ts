import { ValidationError } from "~/shared/errors";
import { MAX_DESCRIPTION_LENGTH, MAX_NAME_LENGTH } from "../limits";
import type { UpdateCollectionInput } from "../types";

const MAX_TAGS = 30;
const MAX_MOVIES = 200;

/**
 * Reads the user-editable fields (name, description, tags) from a request
 * body. Unknown fields such as is_public or user_id are ignored.
 */
export function parseCollectionFields(body: Record<string, unknown>, { requireName }: { requireName: boolean }): UpdateCollectionInput {
  const fields: UpdateCollectionInput = {};

  if (body.name !== undefined || requireName) {
    if (typeof body.name !== "string" || !body.name.trim()) {
      throw new ValidationError("Give your collection a name.", "INVALID_NAME");
    }
    if (body.name.trim().length > MAX_NAME_LENGTH) {
      throw new ValidationError(`Collection names can be at most ${MAX_NAME_LENGTH} characters.`, "INVALID_NAME");
    }
    fields.name = body.name.trim();
  }

  if (body.description !== undefined) {
    if (body.description !== null && typeof body.description !== "string") {
      throw new ValidationError("description must be a string", "INVALID_DESCRIPTION");
    }
    const description = body.description?.trim() || null;
    if (description && description.length > MAX_DESCRIPTION_LENGTH) {
      throw new ValidationError(`Descriptions can be at most ${MAX_DESCRIPTION_LENGTH} characters.`, "INVALID_DESCRIPTION");
    }
    fields.description = description;
  }

  if (body.tags !== undefined) {
    if (!Array.isArray(body.tags) || body.tags.some((tag) => typeof tag !== "string")) {
      throw new ValidationError("tags must be a list of strings", "INVALID_TAGS");
    }
    if (body.tags.length > MAX_TAGS) {
      throw new ValidationError(`A collection can have at most ${MAX_TAGS} keywords.`, "INVALID_TAGS");
    }
    fields.tags = [...new Set((body.tags as string[]).map((tag) => tag.trim()).filter(Boolean))];
  }

  return fields;
}

export function parseMovieIds(value: unknown): number[] {
  if (value === undefined) return [];
  if (!Array.isArray(value) || value.some((id) => !Number.isInteger(id) || id <= 0)) {
    throw new ValidationError("movieIds must be a list of movie ids", "INVALID_MOVIE_IDS");
  }
  if (value.length > MAX_MOVIES) {
    throw new ValidationError(`A collection can have at most ${MAX_MOVIES} movies.`, "INVALID_MOVIE_IDS");
  }
  return value;
}
