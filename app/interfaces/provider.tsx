interface BaseProviderInterface {
    logo_path: string;
    provider_id: number;
    provider_name: string;
    display_priority: number;
}


interface ProviderInterface extends BaseProviderInterface {}

export interface FullProviderInterface extends BaseProviderInterface {
    display_priorities: DisplayPrioritiesInterface
}

interface DisplayPrioritiesInterface {
    [countryCode: string]: number
}

export interface CountryResultInterface {
    link: string;
    flatrate?: ProviderInterface[];
    rent?: ProviderInterface[];
    buy?: ProviderInterface[];
}
  
export interface WatchProvidersByProductionInterface {
    id: number;
    results: {
      [countryCode: string]: CountryResultInterface;
    };
}

export interface WatchProvidersInterface {
    results: FullProviderInterface[]
}