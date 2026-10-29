import { resolveCityGrid } from "../../game/cityGridSystem";
import type { LandmarkId } from "../city3d/cityWorldData";

export type SelectedItem =
  | { type: 'landmark'; id: LandmarkId }
  | { type: 'plot'; plot: ReturnType<typeof resolveCityGrid>['plots'][number] };

export type CityCameraPreset =
  | 'center'
  | 'hq'
  | 'bank'
  | 'stock_exchange'
  | 'factory'
  | 'tech'
  | 'maritime'
  | 'gov'
  | 'trade'
  | 'luxury'
  | 'plots'
  | null;
