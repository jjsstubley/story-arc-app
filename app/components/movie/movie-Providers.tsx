import { Badge, Box, HStack, Image, Link, Stack, Text, Wrap } from '@chakra-ui/react';
import { CountryResultInterface, ProviderInterface } from '~/interfaces/tmdb/provider';

// Known TMDB availability types, in display order. Any type TMDB adds later
// still shows up, with a label derived from its key.
const AVAILABILITY: Record<string, { label: string; color: string }> = {
    flatrate: { label: 'Stream', color: 'green' },
    free: { label: 'Free', color: 'teal' },
    ads: { label: 'Free with ads', color: 'cyan' },
    rent: { label: 'Rent', color: 'orange' },
    buy: { label: 'Buy', color: 'purple' },
};
const ORDER = Object.keys(AVAILABILITY);

const rank = (type: string) => {
    const i = ORDER.indexOf(type);
    return i === -1 ? ORDER.length : i;
};

const labelFor = (type: string) =>
    AVAILABILITY[type]?.label ??
    type.replace(/[_-]+/g, ' ').replace(/^\w/, (c) => c.toUpperCase());

interface GroupedProvider {
    provider: ProviderInterface;
    types: string[];
}

const groupByProvider = (providers: CountryResultInterface): GroupedProvider[] => {
    const byId = new Map<number, GroupedProvider>();

    for (const [type, value] of Object.entries(providers)) {
        if (!Array.isArray(value)) continue;
        for (const provider of value as ProviderInterface[]) {
            const entry = byId.get(provider.provider_id);
            if (entry) {
                if (!entry.types.includes(type)) entry.types.push(type);
                entry.provider.display_priority = Math.min(entry.provider.display_priority, provider.display_priority);
            } else {
                byId.set(provider.provider_id, { provider: { ...provider }, types: [type] });
            }
        }
    }

    const grouped = [...byId.values()];
    grouped.forEach((g) => g.types.sort((a, b) => rank(a) - rank(b)));
    return grouped.sort(
        (a, b) =>
            rank(a.types[0]) - rank(b.types[0]) ||
            a.provider.display_priority - b.provider.display_priority
    );
};

const MovieProviders = ({ providers }: { providers: CountryResultInterface }) => {
    const grouped = groupByProvider(providers);

    if (!grouped.length) {
        return <Text color="fg.muted" textStyle="sm">Not available to watch in your region yet.</Text>;
    }

    return (
        <Stack gap={2}>
            {grouped.map(({ provider, types }) => (
                <HStack
                    key={provider.provider_id}
                    gap={3}
                    p={2}
                    pr={3}
                    rounded="xl"
                    bg="whiteAlpha.50"
                    borderWidth="1px"
                    borderColor="whiteAlpha.100"
                    transition="background 0.15s, border-color 0.15s"
                    _hover={{ bg: 'whiteAlpha.100', borderColor: 'whiteAlpha.200' }}
                >
                    <Image
                        src={`https://image.tmdb.org/t/p/w92${provider.logo_path}`}
                        alt=""
                        boxSize="44px"
                        rounded="lg"
                        flexShrink={0}
                        shadow="md"
                    />
                    <Text fontWeight="semibold" textStyle="sm" flex="1" minW={0} lineClamp={1}>
                        {provider.provider_name}
                    </Text>
                    <Wrap gap={1.5} justify="flex-end">
                        {types.map((type) => (
                            <Badge
                                key={type}
                                size="sm"
                                variant="subtle"
                                rounded="full"
                                px={2.5}
                                colorPalette={AVAILABILITY[type]?.color ?? 'gray'}
                            >
                                {labelFor(type)}
                            </Badge>
                        ))}
                    </Wrap>
                </HStack>
            ))}
            {providers.link && (
                <Box pt={1}>
                    <Link href={providers.link} target="_blank" rel="noopener noreferrer" textStyle="xs" color="fg.muted">
                        Availability data from JustWatch
                    </Link>
                </Box>
            )}
        </Stack>
    );
};

export default MovieProviders;
