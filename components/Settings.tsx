import Segmented from './Segmented';
import { MapType } from '../types';

interface SettingsProps {
  mapTypes: MapType[];
  selectedMapTypeIndex: number;
  onChangeMapType: (index: number) => void;
}

export default function Settings({
  selectedMapTypeIndex,
  mapTypes,
  onChangeMapType,
}: SettingsProps) {
  return (
    <div className="settings">
      <Segmented
        options={mapTypes.map((mapType) => mapType.name)}
        selectedIndex={selectedMapTypeIndex}
        onChange={onChangeMapType}
      />
      <style jsx>{`
        .settings {
          display: flex;
          justify-content: space-between;
          padding-bottom: 20px;
        }
      `}</style>
    </div>
  );
}
