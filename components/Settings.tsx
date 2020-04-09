import Segmented from './Segmented';
import { MapType } from '../types';
import { formatDate } from '../utils/data';

interface SettingsProps {
  selectedDate: Date;
  onChangeDate: (date: Date) => void;
  mapTypes: MapType[];
  selectedMapTypeIndex: number;
  onChangeMapType: (index: number) => void;
}

export default function Settings({
  selectedDate,
  onChangeDate,
  selectedMapTypeIndex,
  mapTypes,
  onChangeMapType,
}: SettingsProps) {
  return (
    <div className="settings">
      <label>
        {formatDate(selectedDate)}
        <input
          type="range"
          value={selectedDate.getTime()}
          min={1586036040044}
          max={new Date().getTime()}
          onChange={(event) => onChangeDate(new Date(Number(event.target.value)))}
        />
      </label>
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
      <style jsx global>{`
        .settings .segmented {
          width: 200px;
        }
      `}</style>
    </div>
  );
}
