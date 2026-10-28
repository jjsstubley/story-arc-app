import { Button, Wrap } from "@chakra-ui/react";
import type { ReactNode } from "react";
import { LuMinus, LuPlus } from "react-icons/lu";

export function Chip({ selected, onClick, children, label }: { selected: boolean; onClick: () => void; children: ReactNode; label?: string }) {
  return (
    <Button
      size="xs"
      rounded="full"
      variant={selected ? "solid" : "outline"}
      colorPalette={selected ? "orange" : "gray"}
      aria-pressed={selected}
      aria-label={label}
      onClick={onClick}
    >
      {children}
    </Button>
  );
}

export function toggleItem<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
}

interface GenreChipsProps {
  genres: { id: number; name: string }[];
  favourite: number[];
  avoided: number[];
  onChange: (next: { favourite: number[]; avoided: number[] }) => void;
}

/** Each genre cycles: no preference → favour → avoid → no preference */
export function GenreChips({ genres, favourite, avoided, onChange }: GenreChipsProps) {
  const cycle = (id: number) => {
    const isFavoured = favourite.includes(id);
    const isAvoided = avoided.includes(id);
    onChange({
      favourite: isFavoured ? favourite.filter((g) => g !== id) : isAvoided ? favourite : [...favourite, id],
      avoided: isFavoured ? [...avoided, id] : avoided.filter((g) => g !== id),
    });
  };

  return (
    <Wrap gap={2}>
      {genres.map((genre) => {
        const isFavoured = favourite.includes(genre.id);
        const isAvoided = avoided.includes(genre.id);
        return (
          <Button
            key={genre.id}
            size="xs"
            rounded="full"
            variant={isFavoured || isAvoided ? "subtle" : "outline"}
            colorPalette={isFavoured ? "green" : isAvoided ? "red" : "gray"}
            aria-label={`${genre.name}: ${isFavoured ? "favoured" : isAvoided ? "avoided" : "no preference"}`}
            onClick={() => cycle(genre.id)}
          >
            {isFavoured && <LuPlus />}
            {isAvoided && <LuMinus />}
            {genre.name}
          </Button>
        );
      })}
    </Wrap>
  );
}
