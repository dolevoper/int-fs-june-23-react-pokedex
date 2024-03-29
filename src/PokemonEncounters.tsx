import { useCallback } from "react";
import { useAsync } from "./useAsync";
import styles from "./PokemonEncounters.module.scss";
import { EncountersResponse, getPokemonEncounters } from "./pokeApi";

type PokemonEncountersProps = { pokemonName: string; onCloseClick: () => void };

export function PokemonEncounters({
  pokemonName,
  onCloseClick,
}: PokemonEncountersProps) {
  const { isLoading, encounters } = usePokemonEncounters(pokemonName);

  if (isLoading) {
    return (
      <div className={styles.wrapper}>
        <article className={styles.dialog}>
          <h2>{pokemonName} - Encounters</h2>
          <p>Loading...</p>
        </article>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <article className={styles.dialog}>
        <h2>{pokemonName} - Encounters</h2>
        <ul className={styles.gameList}>
          {Array.from(encounters.entries()).map(([version, locations]) => (
            <li key={version}>
              <h3>{version}</h3>
              <ul>
                {locations.map(({ location, chance }) => (
                  <li key={location} className={styles.areaListItem}>
                    {location} ({chance}%)
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
        <menu>
          <li>
            <a
              href=""
              onClick={(e) => {
                e.preventDefault();

                onCloseClick();
              }}
            >
              Close
            </a>
          </li>
        </menu>
      </article>
    </div>
  );
}

function usePokemonEncounters(pokemonName: string) {
  const getCurrentPokemonEncounters = useCallback(
    () => getPokemonEncounters(pokemonName),
    [pokemonName]
  );
  const { data, isLoading } = useAsync(getCurrentPokemonEncounters);

  const encounters = toEncounters(data ?? []);

  return {
    isLoading,
    encounters,
  };
}

type Location = {
  location: string;
  chance: number;
};

function toEncounters(encountersResponse: EncountersResponse) {
  const encountersMap = new Map<string, Location[]>();

  for (const { location_area, version_details } of encountersResponse) {
    for (const { version, max_chance } of version_details) {
      if (!encountersMap.has(version.name)) {
        encountersMap.set(version.name, []);
      }

      const locations = encountersMap.get(version.name);

      locations?.push({ location: location_area.name, chance: max_chance });
    }
  }

  return encountersMap;
}
