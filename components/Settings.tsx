import Segmented from './Segmented';
import { MapType } from '../types';
import { MMMMDYYYY } from '../utils/data';

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
      <div className="date">
        <strong>{MMMMDYYYY(selectedDate)}</strong>
        <input
          type="range"
          value={selectedDate.getTime()}
          min={1586036040000}
          max={new Date().getTime()}
          step={1000}
          onChange={(event) => onChangeDate(new Date(Number(event.target.value)))}
        />
      </div>
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

        .date {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 50%;
          margin-right: 50px;
        }

        .date input {
          width: 60%;
          margin-left: 10px;
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
