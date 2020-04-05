import { ReactChild } from 'react';
import Card from './Card';

interface StatProps {
  color?: 'red' | 'gray';
  title: string;
  value: ReactChild;
}

export default function Stat({ color, title, value }: StatProps) {
  return (
    <div className="stat">
      <Card color={color}>
        <strong>{value}</strong>
        <span>{title.toLowerCase()}</span>
      </Card>
      <style jsx>{`
        .stat {
          display: flex;
          flex-direction: column;
          width: 100%;
        }

        strong {
          font-size: 1.5rem;
        }
      `}</style>
    </div>
  );
}
