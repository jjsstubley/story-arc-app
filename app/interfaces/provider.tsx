interface ProviderInterface {
    logo_path: string;
    provider_id: number;
    provider_name: string;
    display_priority: number;
}
  
interface CountryResultInterface {
    link: string;
    flatrate?: ProviderInterface[];
    rent?: ProviderInterface[];
    buy?: ProviderInterface[];
}
  
export interface WatchProvidersInterface {
    id: number;
    results: {
      [countryCode: string]: CountryResultInterface;
    };
}