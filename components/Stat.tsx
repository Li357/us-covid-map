import React, { ReactChild } from 'react';

interface StatProps {
  color?: 'red' | 'gray';
  title: string;
  value: ReactChild;
}

export default function Stat({ color, title, value }: StatProps) {
  return (
    <div className={`stat ${color}`}>
      <strong>{value}</strong>
      <span>{title.toLowerCase()}</span>
      <style jsx>{`
        .stat {
          display: flex;
          flex-direction: column;
          padding: 20px;
          border-radius: 5px;
          width: 100%;
        }

        strong {
          font-size: 1.5rem;
        }

        .red {
          background-color: #ffcdcc;
          color: #ff4945;
        }

        .gray {
          background-color: #e6e6e6;
          color: #898989;
        }
      `}</style>
    </div>
  );
}
