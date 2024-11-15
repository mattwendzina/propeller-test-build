import { z } from "zod";

export const PokemonListItemSchema = z.object({
  name: z.string(),
  url: z.string(),
});

export const PokemonDetailsSchema = z.object({
  sprites: z.object({
    front_default: z.string(),
  }),
  name: z.string(),
  types: z.array(z.object({ type: z.object({ name: z.string() }) })),
});

export const PokemonDataSchema = z.object({
  data: PokemonDetailsSchema,
});

export const PokemonListSchema = z.object({
  results: z.array(PokemonListItemSchema),
});
