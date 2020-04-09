interface SegmentedProps {
  selectedIndex: number;
  options: string[];
  onChange: (index: number) => void;
}

export default function Segmented({ selectedIndex, options, onChange }: SegmentedProps) {
  return (
    <div className="segmented">
      {options.map((option, index) => (
        <div
          key={option}
          className={`option ${selectedIndex === index ? 'selected' : ''}`}
          onClick={() => onChange(index)}
        >
          {option}
        </div>
      ))}
      <style jsx>{`
        .segmented {
          display: flex;
          border-radius: 10px;
          align-items: stretch;
          background-color: #f0f0f0;
          height: 50px;
        }

        .option {
          flex: 1 0 0;
          margin: 5px;
          display: flex;
          border-radius: 5px;
          justify-content: center;
          align-items: center;
        }

        .selected {
          background-color: white;
        }
      `}</style>
    </div>
  );
}
