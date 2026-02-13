import { KeywordItemInterface } from "../keywords";
import { CountryResultInterface } from "../provider";
import { ReviewListsInterface } from "../review";
import { VideoItemInterface } from "../videos";
import { CastInterface } from "../people/cast";
import { CrewInterface } from "../people/crew";

export interface MediaAppendsInterface<T> {
    similar?: T;
    reviews?: ReviewListsInterface;
    keywords?: {
      keywords?: KeywordItemInterface[];
      results?: KeywordItemInterface[];
    };
    providers?: {
      results: {
        [countryCode: string]: CountryResultInterface;
      };
    };
    videos?: {
      results: VideoItemInterface[];
    };
    credits?: {
      cast: CastInterface[];
      crew: CrewInterface[];
    };
}