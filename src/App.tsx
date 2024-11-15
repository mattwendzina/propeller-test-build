import { useQuery } from "@tanstack/react-query";
import "./App.css";
import axios from "axios";
import { PokemonDetailsSchema, PokemonListSchema } from "./schema";
import { useEffect, useMemo, useState } from "react";
import classNames from "classnames";
import { capitalizeFirstLetter } from "./utils";
import { POKEMON_URL } from "./constants";

const fetchData = async () => {
  const response = await axios.get(`${POKEMON_URL}?limit=100`);

  const { results } = PokemonListSchema.parse(response.data);

  return Promise.all(
    results.map(async (pokemon) => {
      const details = await axios.get(pokemon.url);
      return PokemonDetailsSchema.parse(details.data);
    })
  );
};

function App() {
  const { isPending, error, data } = useQuery({
    queryKey: ["pokemonList"],
    queryFn: fetchData,
  });

  const [filters, setFilters] = useState({
    value: "",
    selectedCategory: "",
    results: data,
  });

  const categories = useMemo(() => {
    if (!data) return [];
    const allCategories = data.flatMap((data) =>
      data.types?.map((type) => type.type.name)
    );
    return Array.from(new Set(allCategories));
  }, [data]);

  useEffect(() => {
    if (filters.selectedCategory) {
      const categoryResults = data?.filter((pokemon) =>
        pokemon.types.some(
          (type) => type.type.name === filters.selectedCategory
        )
      );
      setFilters((prev) => {
        return {
          ...prev,
          results: categoryResults?.filter((result) =>
            result.name.includes(filters.value.toLowerCase())
          ),
        };
      });
    } else {
      setFilters((prev) => {
        return {
          ...prev,
          results: data?.filter((result) =>
            result.name.includes(filters.value.toLowerCase())
          ),
        };
      });
    }
  }, [data, filters.value, filters.selectedCategory]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-[auto_1fr]">
      <div className="sidebar h-max sm:h-screen p-4 px-8 bg-blue-200 lg:flex lg:flex-col gap-4">
        <div>
          <h2 className="text-lg font-bold">Search</h2>
          <input
            className="border-solid border-slate-400 rounded border w-max self-center"
            value={filters.value}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, value: e.target.value }))
            }
          />
        </div>
        <div className="h-32 overflow-auto sm:h-full">
          <h2 className="text-lg font-bold"> Categories </h2>
          {categories
            ? categories.map((cat) => (
                <div className="flex gap-x-4 justify-between items-center">
                  <div
                    className={classNames(
                      {
                        "text-red-500": cat === filters.selectedCategory,
                      },
                      "cursor-pointer"
                    )}
                    onClick={() =>
                      setFilters((prev) => ({
                        ...prev,
                        selectedCategory: cat.toLowerCase(),
                      }))
                    }
                  >
                    {capitalizeFirstLetter(cat)}
                  </div>
                  <span
                    className={classNames(
                      cat === filters.selectedCategory
                        ? "visible"
                        : "invisible",
                      "cursor-pointer",
                      "text-sm",
                      "text-slate-500",
                      "hover:text-red-500"
                    )}
                    onClick={() =>
                      setFilters((prev) => ({
                        ...prev,
                        selectedCategory: "",
                        results: data,
                      }))
                    }
                  >
                    Clear
                  </span>
                </div>
              ))
            : null}
        </div>
      </div>
      <div className="w-full flex flex-col">
        <div className="h-screen  overflow-auto">
          {isPending ? <p>Loading...</p> : null}
          {error ? <p>Error loading data</p> : null}
          <ul
            className="grid gap-4 justify-center grid-flow-row"
            style={{
              gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            }}
          >
            {filters.results?.map((pokemon) => (
              <li
                className="flex flex-col items-center list-none"
                key={pokemon.name}
              >
                <img
                  src={pokemon.sprites.front_default}
                  alt={pokemon.name}
                  width={200}
                  height={200}
                />
                <p>{capitalizeFirstLetter(pokemon?.name)}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default App;
